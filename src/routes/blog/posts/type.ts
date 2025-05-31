import type { Component } from "svelte";

export type PostData = {
  content: Component;
  meta: {
    title: string;
    date: string;
    description?: string;
    tags: string[];
  };
}