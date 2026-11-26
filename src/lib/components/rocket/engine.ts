export type RocketMode = 'launch' | 'exploded' | 'tumble';

export interface RocketOptions {
	mode: RocketMode;
	still?: boolean;
	time?: number;
	launchLayer?: 'ground' | 'flight';
	placement?: LaunchPlacement;
}

export interface LaunchPlacement {
	x: number;
	y: number;
	unit: number;
}

export interface LaunchPose {
	x: number;
	y: number;
	vx: number;
	vy: number;
	bodyAngle: number;
}

export interface RocketEngine {
	destroy(): void;
	setTime(time: number): void;
	setLaunchPlacement(placement: LaunchPlacement): void;
	redraw(): void;
}

type Vector3 = [number, number, number];
type PartName = 'b' | 'u' | 'n' | 'z' | 'f';
type PartState = { x: number; y: number; a: number; c: number; py: number; fo: number };
type Segment = {
	part: PartName;
	a: Vector3;
	b: Vector3;
	accent: boolean;
	radius: number;
	finDirection: [number, number] | null;
	middleY: number;
};
type Transform = { x: number; y: number; tilt: number; roll: number };
type Scene = {
	global: Transform;
	parts: Record<PartName, PartState>;
	partGlobal?: Partial<Record<PartName, Transform>>;
	plumes: Array<[PartState, number, number]>;
	reveal: number;
	separated?: boolean;
	explode?: number;
	partAlpha?: Partial<Record<PartName, number>>;
};
type Projection = [number, number, number, number?];

const TAU = 6.2832;
const RADIUS = 0.6;
const SEGMENTS = 24;
const PROFILE_SEGMENTS = 8;
const LIFTOFF_TIME = 4.2;
const STAGE_SEPARATION_TIME = 8;
const LAUNCH_CYCLE_DURATION = 12.5;
const LAUNCH_ACCELERATION = 1.5;
const LAUNCH_TURN_START = 0.45;
const LAUNCH_TURN_DURATION = 4.5;
const LAUNCH_MAX_ANGLE = 0.88;
const LAUNCH_POSE_STEP = 1 / 120;

function flightAngle(elapsed: number): number {
	return LAUNCH_MAX_ANGLE * smooth((elapsed - LAUNCH_TURN_START) / LAUNCH_TURN_DURATION);
}

function buildLaunchPoses(): LaunchPose[] {
	const count = Math.ceil((LAUNCH_CYCLE_DURATION - LIFTOFF_TIME) / LAUNCH_POSE_STEP);
	const poses: LaunchPose[] = [{ x: 0, y: 0, vx: 0, vy: 0, bodyAngle: 0 }];
	let x = 0;
	let y = 0;
	for (let index = 1; index <= count; index++) {
		const elapsed = index * LAUNCH_POSE_STEP;
		const midpoint = elapsed - LAUNCH_POSE_STEP / 2;
		const angle = flightAngle(midpoint);
		const speed = LAUNCH_ACCELERATION * midpoint;
		x += Math.sin(angle) * speed * LAUNCH_POSE_STEP;
		y += Math.cos(angle) * speed * LAUNCH_POSE_STEP;
		const currentAngle = flightAngle(elapsed);
		const currentSpeed = LAUNCH_ACCELERATION * elapsed;
		poses.push({
			x,
			y,
			vx: Math.sin(currentAngle) * currentSpeed,
			vy: Math.cos(currentAngle) * currentSpeed,
			bodyAngle: currentAngle
		});
	}
	return poses;
}

const LAUNCH_POSES = buildLaunchPoses();

export function getLaunchPose(time: number): LaunchPose {
	const elapsed = Math.max(
		0,
		Math.min(time - LIFTOFF_TIME, (LAUNCH_POSES.length - 1) * LAUNCH_POSE_STEP)
	);
	const position = elapsed / LAUNCH_POSE_STEP;
	const index = Math.min(Math.floor(position), LAUNCH_POSES.length - 1);
	const next = Math.min(index + 1, LAUNCH_POSES.length - 1);
	const fraction = position - index;
	const start = LAUNCH_POSES[index];
	const end = LAUNCH_POSES[next];
	const bodyAngle = flightAngle(elapsed);
	const speed = LAUNCH_ACCELERATION * elapsed;
	return {
		x: start.x + (end.x - start.x) * fraction,
		y: start.y + (end.y - start.y) * fraction,
		vx: Math.sin(bodyAngle) * speed,
		vy: Math.cos(bodyAngle) * speed,
		bodyAngle
	};
}

function smooth(value: number): number {
	const t = Math.max(0, Math.min(1, value));
	return t * t * (3 - 2 * t);
}

function makePart(pivotY: number): PartState {
	return { x: 0, y: 0, a: 0, c: 0, py: pivotY, fo: 0 };
}

function makeGeometry(): Segment[] {
	const lines: Segment[] = [];
	const add = (
		part: PartName,
		a: Vector3,
		b: Vector3,
		accent = false,
		radius: number,
		finDirection: [number, number] | null = null
	) => lines.push({ part, a, b, accent, radius, finDirection, middleY: (a[1] + b[1]) / 2 });
	const ring = (part: PartName, y: number, radius: number, accent = false) => {
		for (let i = 0; i < SEGMENTS; i++) {
			const a = (i / SEGMENTS) * TAU;
			const b = ((i + 1) / SEGMENTS) * TAU;
			add(
				part,
				[Math.cos(a) * radius, y, Math.sin(a) * radius],
				[Math.cos(b) * radius, y, Math.sin(b) * radius],
				accent,
				radius
			);
		}
	};
	const profile = (part: PartName, ys: number[], radii: number[]) => {
		for (let j = 0; j < PROFILE_SEGMENTS; j++) {
			const angle = (j / PROFILE_SEGMENTS) * TAU;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			for (let i = 0; i < ys.length - 1; i++) {
				add(
					part,
					[cos * radii[i], ys[i], sin * radii[i]],
					[cos * radii[i + 1], ys[i + 1], sin * radii[i + 1]],
					false,
					(radii[i] + radii[i + 1]) / 2
				);
			}
		}
	};

	ring('b', 0, RADIUS);
	ring('b', 1.6, RADIUS);
	ring('b', 4.2, RADIUS, true);
	profile('b', [0, 4.2], [RADIUS, RADIUS]);
	ring('u', 4.2, RADIUS);
	ring('u', 7, RADIUS);
	profile('u', [4.2, 7], [RADIUS, RADIUS]);

	const noseY: number[] = [];
	const noseRadii: number[] = [];
	for (let i = 0; i <= 8; i++) {
		const t = i / 8;
		noseY.push(7 + t * 2.6);
		noseRadii.push(RADIUS * Math.pow(Math.cos(t * 1.5708), 0.7));
	}
	ring('n', 7, RADIUS);
	ring('n', noseY[3], noseRadii[3]);
	ring('n', noseY[6], noseRadii[6]);
	profile('n', noseY, noseRadii);
	ring('z', -0.75, 0.45);
	ring('z', -0.1, 0.26);
	profile('z', [-0.1, -0.75], [0.26, 0.45]);

	for (let j = 0; j < 4; j++) {
		const angle = (j / 4) * TAU + 0.785;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const fin: Array<[number, number]> = [
			[RADIUS, 1.6],
			[RADIUS + 0.8, 0.5],
			[RADIUS + 0.8, -0.3],
			[RADIUS, 0]
		];
		for (let i = 0; i < 3; i++) {
			add(
				'f',
				[cos * fin[i][0], fin[i][1], sin * fin[i][0]],
				[cos * fin[i + 1][0], fin[i + 1][1], sin * fin[i + 1][0]],
				false,
				RADIUS,
				[cos, sin]
			);
		}
	}
	return lines;
}

const GEOMETRY = makeGeometry();

function createRocket(canvas: HTMLCanvasElement, options: RocketOptions): RocketEngine {
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Rocket canvas requires a 2D rendering context');
	const launchLayer = options.launchLayer ?? 'ground';

	const media = window.matchMedia('(prefers-reduced-motion: reduce)');
	const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
	let width = 0;
	let height = 0;
	let scale = 1;
	let centerX = 0;
	let centerY = 0;
	let unit = 0;
	let cameraX = 0;
	let cameraY = 0;
	let alphaPitch = Math.cos(0.28);
	let betaPitch = Math.sin(0.28);
	let frameTime = 0;
	let placement = options.placement;
	let frameBounds: { left: number; top: number; right: number; bottom: number } | null = null;
	let debugNozzle: [number, number] | null = null;
	let debugPlumeOrigin: [number, number] | null = null;
	const startedAt = performance.now();
	let frozenTime = Number.isFinite(options.time) ? options.time : undefined;
	let frameId: number | null = null;
	let visible = true;
	let destroyed = false;
	const forcedStill = options.still ?? false;
	const palette = { line: '#1e66f5', accent: '#fe640b', mute: '#5c5f77', paper: '#eff1f5' };
	const parts: PartName[] = ['b', 'u', 'n', 'z', 'f'];

	const readColors = () => {
		const style = getComputedStyle(canvas);
		palette.line = style.getPropertyValue('--line').trim() || '#1e66f5';
		palette.accent = style.getPropertyValue('--sig').trim() || '#fe640b';
		palette.mute = style.getPropertyValue('--mute').trim() || '#5c5f77';
		palette.paper = style.getPropertyValue('--paper').trim() || '#eff1f5';
	};

	const resize = (boxWidth: number, boxHeight: number) => {
		width = boxWidth;
		height = boxHeight;
		scale = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		context.setTransform(scale, 0, 0, scale, 0, 0);
		const launch = options.mode === 'launch';
		if (launch && launchLayer === 'flight') {
			unit = placement?.unit ?? Math.min(height / 13.5, width / 6.4);
			centerX = placement?.x ?? width * 0.5;
			centerY = placement?.y ?? height - 44;
			alphaPitch = Math.cos(0.28);
			betaPitch = Math.sin(0.28);
			return;
		}
		unit =
			options.mode === 'exploded'
				? Math.min(height / 15.5, width / 5)
				: options.mode === 'launch'
					? Math.min(height / 13.5, width / 6.4)
					: Math.min(height / 12, width / 4.4);
		centerX = width * (launch ? 0.6 : 0.5);
		centerY =
			options.mode === 'tumble'
				? height / 2 + 4.4 * Math.cos(0.28) * unit
				: height - 44 - 0.9 * Math.cos(0.28) * unit;
		alphaPitch = Math.cos(0.28);
		betaPitch = Math.sin(0.28);
	};

	const transformPoint = (
		point: Vector3,
		part: PartState,
		global: Transform,
		finDirection: [number, number] | null
	): Vector3 => {
		let [x, y, z] = point;
		if (finDirection && part.fo) {
			x += finDirection[0] * part.fo;
			z += finDirection[1] * part.fo;
			y -= part.fo * 0.4;
		}
		const rollCos = Math.cos(global.roll);
		const rollSin = Math.sin(global.roll);
		const rolledX = x * rollCos - z * rollSin;
		z = x * rollSin + z * rollCos;
		x = rolledX;
		y -= part.py;
		if (part.a) {
			const cos = Math.cos(part.a);
			const sin = Math.sin(part.a);
			const nextX = x * cos - y * sin;
			y = x * sin + y * cos;
			x = nextX;
		}
		if (part.c) {
			const cos = Math.cos(part.c);
			const sin = Math.sin(part.c);
			const nextY = y * cos - z * sin;
			z = y * sin + z * cos;
			y = nextY;
		}
		y += part.py + part.y;
		x += part.x;
		y -= 4;
		const tiltCos = Math.cos(global.tilt);
		const tiltSin = Math.sin(global.tilt);
		const nextX = x * tiltCos - y * tiltSin;
		y = x * tiltSin + y * tiltCos;
		x = nextX;
		y += 4;
		return [x + global.x, y + global.y, z];
	};

	const project = (point: Vector3): Projection => {
		if (options.mode === 'launch' && launchLayer === 'flight') {
			return [
				centerX + point[0] * unit,
				centerY - (point[1] * alphaPitch - point[2] * betaPitch) * unit,
				point[1] * betaPitch + point[2] * alphaPitch,
				point[0]
			];
		}
		if (options.mode === 'tumble') {
			const angle = frameTime * 0.37 + 0.4;
			const turn = frameTime * 0.7;
			let [x, y, z] = point;
			y -= 4.4;
			const rotatedX = x * Math.cos(turn) + z * Math.sin(turn);
			z = -x * Math.sin(turn) + z * Math.cos(turn);
			x = rotatedX;
			const nextY = y * Math.cos(angle) - z * Math.sin(angle);
			z = y * Math.sin(angle) + z * Math.cos(angle);
			y = nextY;
			const tilt = angle * 0.6;
			const finalX = x * Math.cos(tilt) - y * Math.sin(tilt);
			y = x * Math.sin(tilt) + y * Math.cos(tilt);
			x = finalX;
			return [centerX + x * unit, height / 2 - y * unit, z, x];
		}
		return [
			centerX + (point[0] - cameraX) * unit,
			centerY - ((point[1] - cameraY) * alphaPitch - point[2] * betaPitch) * unit,
			point[1] * betaPitch + point[2] * alphaPitch,
			point[0]
		];
	};

	const screenPoint = (x: number, y: number, z = 0): Projection => project([x, y, z]);
	const includeProjected = (point: Projection) => {
		if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
		if (!frameBounds) {
			frameBounds = { left: point[0], top: point[1], right: point[0], bottom: point[1] };
			return;
		}
		frameBounds.left = Math.min(frameBounds.left, point[0]);
		frameBounds.top = Math.min(frameBounds.top, point[1]);
		frameBounds.right = Math.max(frameBounds.right, point[0]);
		frameBounds.bottom = Math.max(frameBounds.bottom, point[1]);
	};
	const line = (a: [number, number], b: [number, number]) => {
		context.beginPath();
		context.moveTo(a[0], a[1]);
		context.lineTo(b[0], b[1]);
		context.stroke();
	};
	const sceneA = (time: number): Scene => {
		const global: Transform = { x: 0, y: 0, tilt: 0, roll: 0.6 + time * 0.25 };
		const booster = makePart(2);
		const upper = makePart(7);
		const ascent = time - 4.2;
		const ascentHeight = ascent <= 0 ? 0 : 0.75 * ascent * ascent;
		const gravityTurn = smooth(ascent / 4.5);
		global.y = ascentHeight;
		global.x = ascentHeight * 0.3 * gravityTurn;
		global.tilt = -0.38 * gravityTurn;
		if (time > 3.2 && time < 4.9) {
			global.x += Math.sin(time * 97) * 0.03 * (1 - smooth((time - 4.4) / 0.5));
		}
		const separation = time - 8;
		if (separation > 0) {
			booster.y = -(0.5 * separation + 3.2 * separation * separation);
			booster.x = 0.35 * separation;
			booster.a = 0.9 * separation;
			booster.c = 0.55 * separation;
		}
		const boosterPlume =
			time < 3.4
				? 0
				: time < 4.2
					? 0.3 + 0.7 * smooth((time - 3.4) / 0.8)
					: separation > 0
						? 0
						: 1.25;
		const upperPlume = separation > 0.45 ? 0.75 * smooth((separation - 0.45) / 0.3) : 0;
		return {
			global,
			parts: { b: booster, f: booster, z: booster, u: upper, n: upper },
			plumes: [
				[booster, -0.75, boosterPlume],
				[upper, 4.2, upperPlume]
			],
			reveal: smooth(time / 1.6),
			separated: separation > 0
		};
	};

	const flightScene = (time: number): Scene => {
		const pose = getLaunchPose(time);
		const separated = time >= STAGE_SEPARATION_TIME;
		const booster = makePart(2);
		const upper = makePart(7);
		const global: Transform = {
			x: pose.x,
			y: pose.y,
			tilt: -pose.bodyAngle,
			roll: 0.6 + time * 0.25
		};
		const boosterGlobal: Transform = { ...global };
		let boosterAlpha = 1;
		if (separated) {
			const separationPose = getLaunchPose(STAGE_SEPARATION_TIME);
			const elapsed = time - STAGE_SEPARATION_TIME;
			boosterGlobal.x = separationPose.x + separationPose.vx * elapsed;
			boosterGlobal.y =
				separationPose.y + separationPose.vy * elapsed - 0.5 * 2.8 * elapsed * elapsed;
			boosterGlobal.tilt = -separationPose.bodyAngle + elapsed * 0.12;
			boosterGlobal.roll = 0.6 + STAGE_SEPARATION_TIME * 0.25 + elapsed * 0.16;
			booster.a = elapsed * 0.1;
			booster.c = elapsed * 0.13;
			boosterAlpha = 1 - smooth((time - 9.8) / 0.8);
		}
		return {
			global,
			partGlobal: separated ? { b: boosterGlobal, f: boosterGlobal, z: boosterGlobal } : undefined,
			parts: { b: booster, f: booster, z: booster, u: upper, n: upper },
			plumes: [],
			reveal: 1,
			separated,
			partAlpha: separated ? { b: boosterAlpha, f: boosterAlpha, z: boosterAlpha } : undefined
		};
	};

	const sceneB = (time: number): Scene => {
		const global: Transform = { x: 0, y: 0, tilt: 0, roll: 0.6 + time * 0.45 };
		const explode = smooth((time - 2.6) / 1.4) - smooth((time - 7.2) / 1.4);
		const fins = smooth((time - 2.8) / 1.4) - smooth((time - 7) / 1.4);
		const state: Record<PartName, PartState> = {
			b: makePart(2),
			u: makePart(5.6),
			n: makePart(8.3),
			z: makePart(-0.4),
			f: makePart(0.8)
		};
		state.n.y = 2.4 * fins;
		state.u.y = 1.2 * explode;
		state.z.y = -0.9 * explode;
		state.f.fo = 0.75 * explode;
		global.y = 0.9 * explode;
		return { global, parts: state, plumes: [], reveal: 1, explode };
	};

	const sceneTumble = (time: number): Scene => {
		const body = makePart(2);
		const pulse = 1.3 + 0.08 * Math.sin(time * 23);
		const state = {} as Record<PartName, PartState>;
		for (const part of parts) state[part] = body;
		return {
			global: { x: 0, y: 0, tilt: 0, roll: 0 },
			parts: state,
			plumes: [[body, -0.75, pulse]],
			reveal: 1
		};
	};

	const drawPlume = (part: PartState, global: Transform, y: number, strength: number) => {
		if (strength <= 0) return;
		const baseAlpha = context.globalAlpha;
		const start = project(transformPoint([0, y, 0], part, global, null));
		const end = project(transformPoint([0, y - 1, 0], part, global, null));
		let dx = end[0] - start[0];
		let dy = end[1] - start[1];
		const length = Math.hypot(dx, dy) || 1;
		dx /= length;
		dy /= length;
		context.strokeStyle = palette.accent;
		context.lineWidth = 1;
		for (let i = 0; i < 9; i++) {
			const angle = (i - 4) * 0.055;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const vx = dx * cos - dy * sin;
			const vy = dx * sin + dy * cos;
			const jitter = 1 + 1.4 * (0.5 + 0.5 * Math.sin(i * 12.9898 + frameTime * 19.17));
			const distance = strength * unit * jitter * (1 - Math.abs(i - 4) * 0.12);
			context.globalAlpha = baseAlpha * (0.9 - Math.abs(i - 4) * 0.12);
			context.setLineDash(i % 2 ? [3, 3] : []);
			line([start[0], start[1]], [start[0] + vx * distance, start[1] + vy * distance]);
		}
		context.setLineDash([]);
		context.globalAlpha = baseAlpha;
	};

	const nozzleProjection = (time: number): Projection => {
		const scene = flightScene(time);
		const upperStage = time >= STAGE_SEPARATION_TIME;
		const part = upperStage ? scene.parts.u : scene.parts.b;
		const nozzleY = upperStage ? 4.2 : -0.75;
		const global = upperStage ? scene.global : (scene.partGlobal?.b ?? scene.global);
		return project(transformPoint([0, nozzleY, 0], part, global, null));
	};

	const drawFlightPlume = (time: number, scene: Scene, alpha: number) => {
		const upperStage = time >= STAGE_SEPARATION_TIME;
		const nozzleY = upperStage ? 4.2 : -0.75;
		const part = upperStage ? scene.parts.u : scene.parts.b;
		const global = upperStage ? scene.global : (scene.partGlobal?.b ?? scene.global);
		const strength = upperStage
			? smooth((time - STAGE_SEPARATION_TIME - 0.45) / 0.3)
			: smooth((time - 3.4) / 0.8);
		const nozzle = project(transformPoint([0, nozzleY, 0], part, global, null));
		debugNozzle = [nozzle[0], nozzle[1]];
		if (strength <= 0) return;
		debugPlumeOrigin = [nozzle[0], nozzle[1]];
		const nose = project(transformPoint([0, nozzleY + 1, 0], part, global, null));
		const axisLength = Math.hypot(nose[0] - nozzle[0], nose[1] - nozzle[1]) || 1;
		const axisX = (nose[0] - nozzle[0]) / axisLength;
		const axisY = (nose[1] - nozzle[1]) / axisLength;
		const plumeLength = unit * (0.85 + strength * 0.25);
		const tail: [number, number] = [
			nozzle[0] - axisX * plumeLength,
			nozzle[1] - axisY * plumeLength
		];
		includeProjected([nozzle[0], nozzle[1], nozzle[2]]);
		includeProjected([tail[0], tail[1], nozzle[2]]);
		context.save();
		context.globalAlpha = alpha * strength;
		context.strokeStyle = palette.accent;
		context.lineWidth = 1.4;
		context.setLineDash([2, 2]);
		line([nozzle[0], nozzle[1]], tail);
		context.setLineDash([]);
		context.fillStyle = palette.accent;
		const firstEmission = Math.max(LIFTOFF_TIME, time - 0.72);
		for (let emitted = firstEmission; emitted < time; emitted += 0.09) {
			if (emitted < STAGE_SEPARATION_TIME && upperStage) continue;
			if (emitted >= STAGE_SEPARATION_TIME && !upperStage) continue;
			if (emitted >= STAGE_SEPARATION_TIME && emitted < STAGE_SEPARATION_TIME + 0.45) continue;
			const origin = nozzleProjection(emitted);
			const emittedScene = flightScene(emitted);
			const emittedUpper = emitted >= STAGE_SEPARATION_TIME;
			const emittedNozzleY = emittedUpper ? 4.2 : -0.75;
			const emittedPart = emittedUpper ? emittedScene.parts.u : emittedScene.parts.b;
			const emittedGlobal = emittedUpper
				? emittedScene.global
				: (emittedScene.partGlobal?.b ?? emittedScene.global);
			const emittedNose = project(
				transformPoint([0, emittedNozzleY + 1, 0], emittedPart, emittedGlobal, null)
			);
			const emittedAxisLength = Math.hypot(emittedNose[0] - origin[0], emittedNose[1] - origin[1]);
			const age = time - emitted;
			const drift = age * unit * 0.34;
			const x = origin[0] - ((emittedNose[0] - origin[0]) / emittedAxisLength) * drift;
			const y = origin[1] - ((emittedNose[1] - origin[1]) / emittedAxisLength) * drift;
			context.globalAlpha = alpha * (1 - age / 0.72) * 0.75;
			context.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
		}
		context.restore();
	};

	const drawRocket = (scene: Scene) => {
		const revealY = -0.75 + scene.reveal * 10.4;
		const baseAlpha = context.globalAlpha;
		for (let pass = 0; pass < 2; pass++) {
			for (const segment of GEOMETRY) {
				if (segment.middleY > revealY) continue;
				if (baseAlpha * (scene.partAlpha?.[segment.part] ?? 1) <= 0.01) continue;
				const part = scene.parts[segment.part];
				const partGlobal = scene.partGlobal?.[segment.part] ?? scene.global;
				const a = project(transformPoint(segment.a, part, partGlobal, segment.finDirection));
				const b = project(transformPoint(segment.b, part, partGlobal, segment.finDirection));
				includeProjected(a);
				includeProjected(b);
				const middle: Projection = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
				const axisA = project(transformPoint([0, segment.middleY, 0], part, partGlobal, null));
				const axisB = project(transformPoint([0, segment.middleY + 1, 0], part, partGlobal, null));
				const axisX = axisB[0] - axisA[0];
				const axisY = axisB[1] - axisA[1];
				const axisLength = Math.hypot(axisX, axisY) || 1;
				const distance =
					Math.abs((middle[0] - axisA[0]) * axisY - (middle[1] - axisA[1]) * axisX) / axisLength;
				const hidden = middle[2] < axisA[2] - 0.02 && distance < segment.radius * unit * 0.97;
				if ((pass === 0) !== hidden) continue;
				context.setLineDash(hidden ? [2, 3] : []);
				context.globalAlpha =
					baseAlpha * (scene.partAlpha?.[segment.part] ?? 1) * (hidden ? 0.55 : 1);
				context.strokeStyle = hidden
					? palette.mute
					: segment.accent
						? palette.accent
						: palette.line;
				context.lineWidth = segment.accent && !hidden ? 1.6 : 1;
				line([a[0], a[1]], [b[0], b[1]]);
			}
		}
		context.setLineDash([]);
		context.globalAlpha = baseAlpha;
		if (scene.reveal < 1) {
			const scan = project(transformPoint([0, revealY, 0], scene.parts.u, scene.global, null));
			context.strokeStyle = palette.accent;
			context.lineWidth = 1.5;
			includeProjected([scan[0] - 1.1 * unit, scan[1], scan[2]]);
			includeProjected([scan[0] + 1.1 * unit, scan[1], scan[2]]);
			line([scan[0] - 1.1 * unit, scan[1]], [scan[0] + 1.1 * unit, scan[1]]);
			context.fillStyle = palette.accent;
			context.fillRect(scan[0] + 1.1 * unit - 2, scan[1] - 2, 4, 4);
		}
		context.globalAlpha = baseAlpha;
		for (const [part, y, strength] of scene.plumes) {
			const partGlobal =
				part === scene.parts.b ? (scene.partGlobal?.b ?? scene.global) : scene.global;
			const origin = project(transformPoint([0, y, 0], part, partGlobal, null));
			if (!debugNozzle && strength > 0) debugNozzle = [origin[0], origin[1]];
			if (!debugPlumeOrigin && strength > 0) debugPlumeOrigin = [origin[0], origin[1]];
			drawPlume(part, partGlobal, y, strength);
		}
		context.globalAlpha = baseAlpha;
	};

	const drawGround = (alpha: number) => {
		context.globalAlpha = alpha;
		context.strokeStyle = palette.line;
		context.lineWidth = 1;
		const a = screenPoint(-4.2, -0.9);
		const b = screenPoint(4.2, -0.9);
		line([a[0], a[1]], [b[0], b[1]]);
		for (let x = a[0] + 5; x < b[0]; x += 7) line([x, a[1]], [x - 5, a[1] + 6]);
		context.globalAlpha = 1;
	};

	const drawTower = (time: number, alpha: number) => {
		context.globalAlpha = alpha * 0.8;
		context.strokeStyle = palette.line;
		context.lineWidth = 1;
		const left = -2.4;
		const right = -1.8;
		const top = 8.6;
		const point = (x: number, y: number) => screenPoint(x, y);
		let a = point(left, -0.9);
		let b = point(left, top);
		line([a[0], a[1]], [b[0], b[1]]);
		a = point(right, -0.9);
		b = point(right, top);
		line([a[0], a[1]], [b[0], b[1]]);
		a = point(left, top);
		b = point(right, top);
		line([a[0], a[1]], [b[0], b[1]]);
		for (let y = -0.9; y < top - 0.1; y += 0.75) {
			const p1 = point(left, y);
			const p2 = point(right, y + 0.75);
			const p3 = point(right, y);
			line([p1[0], p1[1]], [p2[0], p2[1]]);
			const p4 = point(left, y);
			line([p3[0], p3[1]], [p4[0], p4[1]]);
		}
		const angle = smooth((time - 3) / 0.7) * 1.15;
		for (const y of [6.4, 3.2]) {
			const endX = right + 1.25 * Math.cos(angle);
			const endY = y + 1.25 * Math.sin(angle);
			const start = point(right, y);
			const end = point(endX, endY);
			const low = point(endX, endY - 0.25 * Math.cos(angle));
			line([start[0], start[1]], [end[0], end[1]]);
			line([start[0], start[1] - 0.25], [low[0], low[1]]);
		}
		context.globalAlpha = alpha * (Math.sin(time * 3.4) > 0.6 ? 1 : 0.25);
		context.fillStyle = palette.accent;
		const beacon = point((left + right) / 2, top + 0.2);
		context.fillRect(beacon[0] - 2.5, beacon[1] - 2.5, 5, 5);
		context.globalAlpha = 1;
	};

	const drawRuler = (alpha: number) => {
		context.globalAlpha = alpha * 0.7;
		context.strokeStyle = palette.line;
		context.lineWidth = 1;
		const first = Math.floor(cameraY - (height - centerY) / (alphaPitch * unit)) - 1;
		const last = Math.ceil(cameraY + centerY / (alphaPitch * unit)) + 1;
		for (let y = first; y <= last; y++) {
			const screenY = centerY - (y - cameraY) * alphaPitch * unit;
			const tickLength = y % 5 === 0 ? 10 : 5;
			line([width - 10 - tickLength, screenY], [width - 10, screenY]);
		}
		line([width - 10, 0], [width - 10, height]);
		context.globalAlpha = 1;
	};

	const drawTrail = (time: number, alpha: number) => {
		if (time < LIFTOFF_TIME) return;
		const segments: Array<[number, number]> =
			time < STAGE_SEPARATION_TIME
				? [[LIFTOFF_TIME, time]]
				: [
						[LIFTOFF_TIME, STAGE_SEPARATION_TIME - 0.001],
						[STAGE_SEPARATION_TIME, time]
					];
		context.save();
		context.strokeStyle = palette.line;
		context.globalAlpha = alpha * 0.55;
		context.setLineDash([3, 4]);
		for (const [start, end] of segments) {
			context.beginPath();
			const span = Math.max(0, end - start);
			const steps = Math.ceil(span / 0.05);
			for (let index = 0; index <= steps; index++) {
				const t = index === steps ? end : start + (span * index) / Math.max(steps, 1);
				const point = nozzleProjection(t);
				if (index === 0) context.moveTo(point[0], point[1]);
				else context.lineTo(point[0], point[1]);
			}
			context.stroke();
		}
		context.setLineDash([]);
		context.restore();
	};

	const drawSeparationChain = (scene: Scene) => {
		if (!scene.explode) return;
		const booster = scene.parts.b;
		const a = project(transformPoint([0, -2.6, 0], booster, scene.global, null));
		const b = project(transformPoint([0, 13.4, 0], booster, scene.global, null));
		context.globalAlpha = scene.explode * 0.7;
		context.strokeStyle = palette.line;
		context.setLineDash([14, 3, 2, 3]);
		line([a[0], a[1]], [b[0], b[1]]);
		context.setLineDash([]);
		for (const [name, y] of [
			['n', 7],
			['u', 4.2],
			['z', -0.1]
		] as const) {
			const point = project(transformPoint([0, y, 0], scene.parts[name], scene.global, null));
			context.fillStyle = palette.accent;
			context.fillRect(point[0] - 2, point[1] - 2, 4, 4);
		}
		context.globalAlpha = 1;
	};

	const drawTumbleGuide = () => {
		context.globalAlpha = 0.3;
		context.strokeStyle = palette.line;
		context.setLineDash([1, 4]);
		context.beginPath();
		context.arc(centerX, height / 2, Math.min(width, height) / 2 - 4, 0, TAU);
		context.stroke();
		context.setLineDash([]);
		context.globalAlpha = 1;
	};

	const writeDebugFrame = (time: number) => {
		if (!window.location.hash.slice(1).split('&').includes('debug')) return;
		const rect = canvas.getBoundingClientRect();
		const toPagePoint = (point: [number, number] | null) =>
			point ? { x: rect.left + point[0], y: rect.top + point[1] } : null;
		const bounds = frameBounds
			? {
					left: rect.left + frameBounds.left,
					top: rect.top + frameBounds.top,
					right: rect.left + frameBounds.right,
					bottom: rect.top + frameBounds.bottom
				}
			: null;
		const pose = getLaunchPose(time);
		canvas.dataset.rocketFrame = JSON.stringify({
			time,
			bounds,
			nozzle: toPagePoint(debugNozzle),
			plumeOrigin: toPagePoint(debugPlumeOrigin),
			bodyAngle: pose.bodyAngle,
			velocityAngle: Math.atan2(pose.vx, pose.vy)
		});
	};

	const drawFrame = (time: number) => {
		if (destroyed || !width || !height) return;
		frameTime = time;
		frameBounds = null;
		debugNozzle = null;
		debugPlumeOrigin = null;
		context.clearRect(0, 0, width, height);
		cameraX = 0;
		cameraY = 0;
		if (options.mode === 'launch' && launchLayer === 'ground') {
			const stationary = (forcedStill || media.matches) && frozenTime === undefined;
			const groundTime = stationary ? stillTime() : Math.min(time, LIFTOFF_TIME);
			const scene = sceneA(groundTime);
			if (!stationary && time >= LIFTOFF_TIME) scene.plumes = [];
			const groundAlpha = stationary ? 1 : 1 - smooth((time - 11) / 1);
			const rocketAlpha = stationary
				? 1
				: time <= LIFTOFF_TIME
					? 1
					: 1 - smooth((time - LIFTOFF_TIME) / 0.3);
			drawRuler(groundAlpha);
			drawGround(groundAlpha);
			drawTower(time, groundAlpha);
			if (rocketAlpha > 0.01) {
				context.save();
				context.globalAlpha = rocketAlpha;
				drawRocket(scene);
				context.restore();
			}
		} else if (options.mode === 'launch') {
			const stationary = (forcedStill || media.matches) && frozenTime === undefined;
			if (!stationary && time >= LIFTOFF_TIME) {
				const scene = flightScene(time);
				const alpha = 1 - smooth((time - 10.8) / 1.3);
				drawTrail(time, alpha);
				if (alpha > 0.01) {
					drawRocket(scene);
					drawFlightPlume(time, scene, alpha);
				}
			}
		} else if (options.mode === 'exploded') {
			const scene = sceneB(time);
			drawGround(1);
			drawSeparationChain(scene);
			drawRocket(scene);
		} else {
			const scene = sceneTumble(time);
			drawTumbleGuide();
			drawRocket(scene);
		}
		// The read values are kept here so all four runtime tokens are refreshed with the theme.
		void palette.mute;
		void palette.paper;
		writeDebugFrame(time);
	};

	const stillTime = () => (options.mode === 'launch' ? 4.35 : options.mode === 'exploded' ? 5 : 0);
	const shouldAnimate = () =>
		!destroyed &&
		!forcedStill &&
		!media.matches &&
		frozenTime === undefined &&
		visible &&
		document.visibilityState === 'visible';
	const stop = () => {
		if (frameId !== null) cancelAnimationFrame(frameId);
		frameId = null;
	};
	const tick = (now: number) => {
		if (!shouldAnimate()) {
			stop();
			return;
		}
		const elapsed = (now - startedAt) / 1000;
		const duration =
			options.mode === 'launch'
				? LAUNCH_CYCLE_DURATION
				: options.mode === 'exploded'
					? 10
					: Infinity;
		drawFrame(Number.isFinite(duration) ? elapsed % duration : elapsed);
		frameId = requestAnimationFrame(tick);
	};
	const update = () => {
		stop();
		if (frozenTime !== undefined) drawFrame(frozenTime);
		else if (forcedStill || media.matches) drawFrame(stillTime());
		else if (shouldAnimate()) frameId = requestAnimationFrame(tick);
	};
	const onVisibility = () => update();
	const onMotionChange = () => update();
	const onColorChange = () => {
		readColors();
		drawFrame(frameTime);
	};

	readColors();
	const resizeObserver = new ResizeObserver((entries) => {
		const box = entries[0]?.contentRect;
		if (box) {
			resize(box.width, box.height);
			update();
		}
	});
	resizeObserver.observe(canvas);
	const initialBox = canvas.getBoundingClientRect();
	resize(initialBox.width, initialBox.height);
	const intersectionObserver = new IntersectionObserver((entries) => {
		visible = entries[0]?.isIntersecting ?? true;
		update();
	});
	intersectionObserver.observe(canvas);
	document.addEventListener('visibilitychange', onVisibility);
	media.addEventListener('change', onMotionChange);
	colorScheme.addEventListener('change', onColorChange);
	update();

	return {
		destroy() {
			destroyed = true;
			stop();
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			media.removeEventListener('change', onMotionChange);
			colorScheme.removeEventListener('change', onColorChange);
		},
		setTime(time: number) {
			frozenTime = Number.isFinite(time) ? Math.max(0, time) : undefined;
			update();
		},
		setLaunchPlacement(nextPlacement: LaunchPlacement) {
			placement = nextPlacement;
			if (options.mode === 'launch' && launchLayer === 'flight') {
				centerX = placement.x;
				centerY = placement.y;
				unit = placement.unit;
				update();
			}
		},
		redraw() {
			readColors();
			if (frozenTime !== undefined) drawFrame(frozenTime);
			else if (forcedStill || media.matches) drawFrame(stillTime());
			else if (!shouldAnimate()) drawFrame(0);
		}
	};
}

export { createRocket };
