export const quotes = [
  "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.",
  "We used to look up at the sky and wonder at our place in the stars. Now we just look down and worry about our place in the dirt.",
  "Do not go gentle into that good night. Rage, rage against the dying of the light.",
  "Maybe we've spent too long trying to figure all this out with theory.",
  "Mankind was born on Earth. It was never meant to die here.",
  "Time is relative, okay? It can stretch and it can squeeze, but it can't run backwards. Just can't.",
  "You're not supposed to be afraid of death. You're supposed to be afraid of never trying.",
  "We've always defined ourselves by the ability to overcome the impossible.",
  "Once you're a parent, you're the ghost of your children's future.",
  "The only thing that can move across dimensions, like time, is gravity."
];

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}