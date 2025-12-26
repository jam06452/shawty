<script lang="ts">
	export let data;
</script>

<div class="flex items-center justify-center p-6 min-h-[calc(100vh-73px)]">
	<div class="w-full max-w-3xl">
		<!-- Main Card -->
		<div class="bg-zinc-900 rounded-2xl shadow-lg p-8 text-center space-y-6">
			<h2 class="text-2xl font-semibold">Short links for Hack Club members</h2>
			
			{#if data?.user}
				<div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
					<p class="text-lg text-emerald-400">✅ Logged in as {data.user.email}</p>
					<a href="/dashboard" class="inline-block mt-4 px-6 py-3 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-200">
						Go to Dashboard →
					</a>
				</div>
			{:else}
				<p class="text-zinc-400">Create and manage your short links with Hack Club authentication</p>
				<a href="/login" class="inline-block px-8 py-4 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-200 text-lg">
					Log in with Hack Club
				</a>
			{/if}
		</div>
	</div>
</div>
