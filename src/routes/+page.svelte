<script lang="ts">
	import { courses } from '$lib';

  // Group the courses by lang
  let groupedCourses: Record<string, { title: string; url: string }[]> = {};

  for (const course of courses) {
    if (!groupedCourses[course.lang]) {
      groupedCourses[course.lang] = [];
    }

    groupedCourses[course.lang].push({ title: course.title, url: course.url });
  }
</script>

<div class="container mx-auto px-4 py-8">
	{#each Object.entries(groupedCourses) as [lang, courses]}
		<h2>{lang}</h2>
    <ul>
      {#each courses as course}
        <li>
          <a class="text-blue-500 hover:underline" href={course.url}>{course.title}</a>
        </li>
      {/each}
    </ul>
	{/each}
</div>
