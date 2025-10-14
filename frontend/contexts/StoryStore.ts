export type Comment = { id: string; user: string; text: string };

export type Story = {
  id: string;
  user: string;
  text?: string;
  image?: string;
  comments: Comment[];
  reactions?: { [emoji: string]: number };
};

let stories: Story[] = [];
let activeIndex = 0;

export function setStories(data: Story[]) {
  stories = data;
}

export function getStories(): Story[] {
  return stories;
}

export function setActiveIndex(index: number) {
  activeIndex = index;
}

export function getActiveIndex(): number {
  return activeIndex;
}
