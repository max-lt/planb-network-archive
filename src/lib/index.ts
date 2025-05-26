// place files you want to import through the `$lib` alias in this folder.

import _courses from './courses.json';

interface ToCEntry {
  title: string;
  goal: string;
  url: string;
  lang: string;
}

const courses: ToCEntry[] = _courses;

export { courses };
