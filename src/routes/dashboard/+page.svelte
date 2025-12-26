<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 p-6">
	<div class="max-w-3xl mx-auto space-y-8">
		<!-- Header -->
		<header class="flex items-center justify-between">
			<a href="/" class="text-3xl font-bold tracking-tight hover:text-zinc-300">shawty</a>
			<a href="/auth/logout" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">
				Logout
			</a>
		</header>

		<!-- Shorten Card -->
		<div class="bg-zinc-900 rounded-2xl shadow-lg p-6 space-y-4">
			<h2 class="text-xl font-semibold">Shorten a link</h2>
			<form method="POST" class="flex gap-3">
				<input
					name="url"
					placeholder="https://example.com/very/long/link"
					required
					class="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
				/>
				<button class="px-6 py-3 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-200">
					Shorten
				</button>
			</form>
			<p class="text-xs text-zinc-400">
				Your short link will look like: <span class="text-zinc-200">vejas.site/abc123</span>
			</p>
		</div>

		<!-- Success/Error Messages -->
		{#if form?.error}
			<div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
				❌ {form.error}
			</div>
		{/if}

		{#if form?.success && form?.shortCode}
			<div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
				<p class="text-lg text-emerald-400 mb-3">✅ Short link created!</p>
				<a href="/{form.shortCode}" class="text-xl font-medium text-white hover:underline">
					{typeof window !== 'undefined' ? window.location.origin : 'https://vejas.site'}/{form.shortCode}
				</a>
			</div>
		{/if}

		<!-- Links Table -->
		<div class="bg-zinc-900 rounded-2xl shadow-lg p-6">
			<h2 class="text-xl font-semibold mb-4">Your links</h2>
			{#if data.links && data.links.length > 0}
				<div class="space-y-3">
					{#each data.links as link}
						<div class="flex items-center justify-between rounded-xl bg-zinc-800 px-4 py-3">
							<div class="flex flex-col min-w-0 flex-1">
								<a href="/{link.short_code}" class="text-sm font-medium text-blue-400 hover:underline">
									vejas.site/{link.short_code}
								</a>
								<a 
									href={link.long_url} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="text-xs text-zinc-400 truncate hover:text-zinc-300"
								>
									{link.long_url}
								</a>
							</div>
							<div class="flex items-center gap-4 text-sm ml-4">
								<span class="text-zinc-400 whitespace-nowrap">{link.clicks} clicks</span>
								<button 
									onclick={() => navigator.clipboard.writeText(`${window.location.origin}/${link.short_code}`)}
									class="hover:underline text-blue-400"
								>
									Copy
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-zinc-400 text-center py-8">No links yet. Create one above!</p>
			{/if}
		</div>
	</div>
</div>
