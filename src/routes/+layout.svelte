<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<nav class="main-nav border-b border-gray-200 bg-white py-4">
	<div class="container px-4 mx-auto flex justify-between items-center">
		<a href="/">Home</a>
	</div>
</nav>

{@render children()}
