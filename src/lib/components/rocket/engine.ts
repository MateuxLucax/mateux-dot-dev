export type RocketMode = 'launch' | 'exploded' | 'tumble';

export interface RocketOptions {
	mode: RocketMode;
	still?: boolean;
	time?: number;
}

export interface AmbientLaunchState {
	/** Sway of the rocket in rocket units. */
	x: number;
	y: number;
	/** Lean from vertical, in radians. */
	bodyAngle: number;
	/** Roll about the long axis, in radians. */
	roll: number;
	plumeStrength: number;
	/** Distance the world has scrolled past the rocket, in rocket units. */
	scroll: number;
}

export interface RocketEngine {
	destroy(): void;
	setTime(time: number): void;
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
const TWO_PI = Math.PI * 2;
const RADIUS = 0.6;
const SEGMENTS = 24;
const PROFILE_SEGMENTS = 8;
const FAIRING_RADIUS = 0.68;
/**
 * Every motion in the climb is a periodic function of time whose period divides this one,
 * so the frame at t and the frame at t + period are identical and the loop has no seam.
 */
export const AMBIENT_LAUNCH_PERIOD_SECONDS = 24;
const CLIMB_SPEED = 1.25;
/** World units scrolled per period; every scrolling pattern tiles evenly into it. */
export const AMBIENT_SCROLL_CYCLE = CLIMB_SPEED * AMBIENT_LAUNCH_PERIOD_SECONDS;
const LAUNCH_STILL_TIME = 3;
const LAUNCH_ANGLE = 0.2;
const RULER_MAJOR_EVERY = 5;
const NEAR_MARK_TILE = 10;
const FAR_MARK_TILE = 5;
const FAR_MARK_SPEED = 0.5;
const TRAJECTORY_DASH = 0.1;
const TRAJECTORY_GAP = 0.2;

const modulo = (value: number, length: number) => ((value % length) + length) % length;
const wave = (time: number, period: number, phase = 0) =>
	Math.sin((TWO_PI * modulo(time, period)) / period + phase);

export function getAmbientLaunchState(time: number): AmbientLaunchState {
	const phase = modulo(time, AMBIENT_LAUNCH_PERIOD_SECONDS);
	return {
		x: 0.09 * wave(phase, 12) + 0.03 * wave(phase, 8, 1.1),
		y: 0.07 * wave(phase, 24, 0.4) + 0.03 * wave(phase, 6),
		bodyAngle: LAUNCH_ANGLE + 0.018 * wave(phase, 24, 0.2) + 0.006 * wave(phase, 8),
		roll: 0.6 + (TWO_PI * phase) / AMBIENT_LAUNCH_PERIOD_SECONDS,
		plumeStrength: 1 + 0.05 * wave(phase, 1.5) + 0.03 * wave(phase, 0.75, 1.3),
		scroll: CLIMB_SPEED * phase
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
	ring('u', 6.4, RADIUS);
	profile('u', [4.2, 6.4], [RADIUS, RADIUS]);

	// Payload fairing: a short adapter, a cylinder a little wider than the upper stage,
	// and a tangent ogive that closes on a small spherical cap.
	const fairingY = [6.4, 6.7, 7.9];
	const fairingRadii = [RADIUS, FAIRING_RADIUS, FAIRING_RADIUS];
	const ogiveLength = 1.95;
	const ogiveStart = 7.9;
	const rho = (FAIRING_RADIUS ** 2 + ogiveLength ** 2) / (2 * FAIRING_RADIUS);
	const capRadius = 0.07;
	for (let i = 1; i <= 10; i++) {
		const s = (i / 10) * ogiveLength;
		const radius = Math.sqrt(rho ** 2 - s ** 2) + FAIRING_RADIUS - rho;
		if (radius <= capRadius) break;
		fairingY.push(ogiveStart + s);
		fairingRadii.push(radius);
	}
	const capBase = fairingY[fairingY.length - 1];
	const capBaseRadius = fairingRadii[fairingRadii.length - 1];
	for (let i = 1; i <= 3; i++) {
		const angle = (i / 3) * (Math.PI / 2);
		fairingY.push(capBase + Math.sin(angle) * capBaseRadius * 0.8);
		fairingRadii.push(Math.cos(angle) * capBaseRadius);
	}
	ring('n', 6.7, FAIRING_RADIUS);
	ring('n', ogiveStart, FAIRING_RADIUS);
	ring('n', fairingY[7], fairingRadii[7]);
	ring('n', capBase, capBaseRadius);
	profile('n', fairingY, fairingRadii);
	// The clamshell seam, drawn as the accent so the fairing reads as two halves.
	for (const angle of [Math.PI / PROFILE_SEGMENTS, Math.PI / PROFILE_SEGMENTS + Math.PI]) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		for (let i = 1; i < fairingY.length - 1; i++) {
			add(
				'n',
				[cos * fairingRadii[i], fairingY[i], sin * fairingRadii[i]],
				[cos * fairingRadii[i + 1], fairingY[i + 1], sin * fairingRadii[i + 1]],
				true,
				(fairingRadii[i] + fairingRadii[i + 1]) / 2
			);
		}
	}
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

/** The rocket's line segments in model space, for tests. */
export function getRocketGeometry(): ReadonlyArray<
	Pick<Segment, 'part' | 'a' | 'b' | 'accent' | 'radius'>
> {
	return GEOMETRY;
}

const GEOMETRY_BOTTOM = Math.min(...GEOMETRY.flatMap((segment) => [segment.a[1], segment.b[1]]));
const GEOMETRY_TOP = Math.max(...GEOMETRY.flatMap((segment) => [segment.a[1], segment.b[1]]));

/** The model-space height the reveal sweep has reached; at 1 it covers the whole rocket. */
export function getRevealHeight(reveal: number): number {
	return GEOMETRY_BOTTOM + reveal * (GEOMETRY_TOP - GEOMETRY_BOTTOM);
}

function createRocket(canvas: HTMLCanvasElement, options: RocketOptions): RocketEngine {
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Rocket canvas requires a 2D rendering context');

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
	let frameBounds: { left: number; top: number; right: number; bottom: number } | null = null;
	let debugNozzle: [number, number] | null = null;
	let debugPlumeOrigin: [number, number] | null = null;
	let elapsedTime = options.mode === 'launch' ? Math.random() * AMBIENT_LAUNCH_PERIOD_SECONDS : 0;
	let lastFrameAt: number | null = null;
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
		alphaPitch = Math.cos(0.28);
		betaPitch = Math.sin(0.28);
		unit =
			options.mode === 'exploded'
				? Math.min(height / 15.5, width / 5)
				: launch
					? Math.min(height / 15.5, width / 5.4)
					: Math.min(height / 12, width / 4.4);
		centerX = width * 0.5;
		// In the climb, the rocket's pivot (y = 4) sits a little above the middle so the plume
		// and trajectory have room below it.
		centerY =
			options.mode === 'tumble'
				? height / 2 + 4.4 * Math.cos(0.28) * unit
				: launch
					? height * 0.45 + 4 * alphaPitch * unit
					: height - 44 - 0.9 * Math.cos(0.28) * unit;
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
		if (options.mode === 'launch') {
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
	const ambientScene = (state: AmbientLaunchState): Scene => {
		const body = makePart(2);
		return {
			global: { x: state.x, y: state.y, tilt: -state.bodyAngle, roll: state.roll },
			parts: { b: body, f: body, z: body, u: body, n: body },
			plumes: [[body, -0.75, state.plumeStrength]],
			reveal: 1
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

	const drawPlume = (
		part: PartState,
		global: Transform,
		y: number,
		strength: number,
		ambientTime?: number
	) => {
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
			const noise =
				ambientTime === undefined
					? Math.sin(i * 12.9898 + frameTime * 19.17)
					: Math.sin(i * 12.9898 + (TWO_PI * modulo(ambientTime, 0.75)) / 0.75);
			const jitter = ambientTime === undefined ? 1 + 1.4 * (0.5 + 0.5 * noise) : 1.7 + 0.35 * noise;
			const distance = strength * unit * jitter * (1 - Math.abs(i - 4) * 0.12);
			context.globalAlpha = baseAlpha * (0.9 - Math.abs(i - 4) * 0.12);
			context.setLineDash(i % 2 ? [3, 3] : []);
			line([start[0], start[1]], [start[0] + vx * distance, start[1] + vy * distance]);
		}
		context.setLineDash([]);
		context.globalAlpha = baseAlpha;
	};

	const drawRocket = (scene: Scene, ambientTime?: number) => {
		const revealY = getRevealHeight(scene.reveal);
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
			drawPlume(part, partGlobal, y, strength, ambientTime);
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

	/** Screen y of a world height, for the world scrolling past the climbing rocket. */
	const worldToScreenY = (worldY: number, scroll: number) =>
		centerY - (worldY - scroll) * alphaPitch * unit;
	const visibleWorldRange = (scroll: number): [number, number] => [
		Math.floor(scroll - (height - centerY) / (alphaPitch * unit)) - 1,
		Math.ceil(scroll + centerY / (alphaPitch * unit)) + 1
	];

	const drawRuler = (state: AmbientLaunchState) => {
		const scroll = modulo(state.scroll, AMBIENT_SCROLL_CYCLE);
		const [first, last] = visibleWorldRange(scroll);
		const x = width - 1;
		context.save();
		context.globalAlpha = 0.6;
		context.strokeStyle = palette.line;
		context.lineWidth = 1;
		for (let y = first; y <= last; y++) {
			const screenY = Math.round(worldToScreenY(y, scroll)) + 0.5;
			const tick = modulo(y, RULER_MAJOR_EVERY) === 0 ? 9 : 4;
			line([x - tick, screenY], [x, screenY]);
		}
		context.restore();
	};

	const drawDraftingMarks = (state: AmbientLaunchState) => {
		context.save();
		context.lineWidth = 1;
		// Near layer: short construction strokes moving at the climb speed.
		const near = modulo(state.scroll, AMBIENT_SCROLL_CYCLE);
		const [nearFirst, nearLast] = visibleWorldRange(near);
		context.globalAlpha = 0.3;
		context.strokeStyle = palette.line;
		const span = Math.min(width * 0.2, 2.2 * unit);
		const nearX = [0.08, 0.7, 0.22];
		for (let k = Math.floor(nearFirst / NEAR_MARK_TILE); k <= nearLast / NEAR_MARK_TILE; k++) {
			const y = Math.round(worldToScreenY(k * NEAR_MARK_TILE + 3, near)) + 0.5;
			const x = Math.round(width * nearX[modulo(k, nearX.length)]) + 0.5;
			line([x, y], [x + span, y]);
			line([x + span * 0.25, y + 4], [x + span * 0.7, y + 4]);
		}
		// Far layer: small crosshairs at half the speed, for depth.
		const far = modulo(state.scroll * FAR_MARK_SPEED, AMBIENT_SCROLL_CYCLE * FAR_MARK_SPEED);
		const [farFirst, farLast] = visibleWorldRange(far);
		context.globalAlpha = 0.28;
		context.strokeStyle = palette.mute;
		const size = Math.max(3, Math.min(5, unit * 0.12));
		const farX = [0.86, 0.14, 0.62];
		for (let k = Math.floor(farFirst / FAR_MARK_TILE); k <= farLast / FAR_MARK_TILE; k++) {
			const y = Math.round(worldToScreenY(k * FAR_MARK_TILE + 1.5, far)) + 0.5;
			const x = Math.round(width * farX[modulo(k, farX.length)]) + 0.5;
			line([x - size, y], [x + size, y]);
			line([x, y - size], [x, y + size]);
		}
		context.restore();
	};

	const drawAmbientTrajectory = (scene: Scene, state: AmbientLaunchState) => {
		const booster = scene.parts.b;
		const start = project(transformPoint([0, -3.2, 0], booster, scene.global, null));
		const next = project(transformPoint([0, -4.2, 0], booster, scene.global, null));
		const directionX = next[0] - start[0];
		const directionY = next[1] - start[1];
		const reach = Math.max(width, height) * 2;
		const length = Math.hypot(directionX, directionY) || 1;
		const end: [number, number] = [
			start[0] + (directionX / length) * reach,
			start[1] + (directionY / length) * reach
		];
		context.save();
		context.globalAlpha = 0.5;
		context.strokeStyle = palette.line;
		context.lineWidth = 1;
		context.setLineDash([TRAJECTORY_DASH * unit, TRAJECTORY_GAP * unit]);
		// The dashes flow away from the rocket at the climb speed and repeat exactly per period.
		context.lineDashOffset = -modulo(state.scroll, TRAJECTORY_DASH + TRAJECTORY_GAP) * unit;
		line([start[0], start[1]], end);
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
			['n', 6.4],
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

	const writeDebugFrame = (time: number, state: AmbientLaunchState | null) => {
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
		canvas.dataset.rocketFrame = JSON.stringify({
			time,
			bounds,
			nozzle: toPagePoint(debugNozzle),
			plumeOrigin: toPagePoint(debugPlumeOrigin),
			bodyAngle: state?.bodyAngle,
			roll: state?.roll,
			plumeStrength: state?.plumeStrength,
			scroll: state?.scroll
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
		const ambientState = options.mode === 'launch' ? getAmbientLaunchState(time) : null;
		if (ambientState) {
			const scene = ambientScene(ambientState);
			drawDraftingMarks(ambientState);
			drawRuler(ambientState);
			drawAmbientTrajectory(scene, ambientState);
			drawRocket(scene, modulo(time, AMBIENT_LAUNCH_PERIOD_SECONDS));
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
		writeDebugFrame(time, ambientState);
	};

	const stillTime = () =>
		options.mode === 'launch' ? LAUNCH_STILL_TIME : options.mode === 'exploded' ? 5 : 0;
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
			lastFrameAt = null;
			return;
		}
		if (lastFrameAt !== null) elapsedTime += (now - lastFrameAt) / 1000;
		lastFrameAt = now;
		drawFrame(options.mode === 'exploded' ? elapsedTime % 10 : elapsedTime);
		frameId = requestAnimationFrame(tick);
	};
	const update = () => {
		stop();
		lastFrameAt = null;
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
		redraw() {
			readColors();
			if (frozenTime !== undefined) drawFrame(frozenTime);
			else if (forcedStill || media.matches) drawFrame(stillTime());
			else if (!shouldAnimate()) drawFrame(options.mode === 'launch' ? elapsedTime : 0);
		}
	};
}

export { createRocket };
