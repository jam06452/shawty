<script lang="ts">
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    
    // Track which link's menu is open
    let openMenuId = $state<string | null>(null);
    
    // Track which QR code is being shown
    let showQrId = $state<string | null>(null);
    
    function toggleMenu(linkId: string) {
        openMenuId = openMenuId === linkId ? null : linkId;
    }
    
    function showQr(linkId: string) {
        showQrId = linkId;
        openMenuId = null;
    }
    
    function closeQr() {
        showQrId = null;
    }
</script>

<div class="p-6">
    <div class="max-w-3xl mx-auto space-y-8">

        <!-- Shorten Card -->
        <div class="bg-zinc-900 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 class="text-xl font-semibold">Shorten a link</h2>
            <form method="POST" action="?/create" class="flex gap-3">
                <input
                    name="url"
                    placeholder="example.com or https://example.com"
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
                                
                                <!-- Menu Button -->
                                <div class="relative">
                                    <button 
                                        onclick={() => toggleMenu(link.id)}
                                        class="w-8 h-8 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                        title="More options"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2"></circle>
                                            <circle cx="12" cy="12" r="2"></circle>
                                            <circle cx="12" cy="19" r="2"></circle>
                                        </svg>
                                    </button>
                                    
                                    <!-- Dropdown Menu -->
                                    {#if openMenuId === link.id}
                                        <div class="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 z-10">
                                            <button 
                                                onclick={() => showQr(link.id)}
                                                class="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 flex items-center gap-3"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <rect x="3" y="3" width="7" height="7"></rect>
                                                    <rect x="14" y="3" width="7" height="7"></rect>
                                                    <rect x="14" y="14" width="7" height="7"></rect>
                                                    <rect x="3" y="14" width="7" height="7"></rect>
                                                </svg>
                                                Show QR Code
                                            </button>
                                            <form method="POST" action="?/delete" class="w-full">
                                                <input type="hidden" name="linkId" value={link.id} />
                                                <button 
                                                    type="submit"
                                                    class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-3"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    {/if}
                                </div>
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

<!-- QR Code Modal -->
{#if showQrId}
    {@const link = data.links.find(l => l.id === showQrId)}
    {#if link}
        <div 
            class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onclick={closeQr}
        >
            <div 
                class="bg-zinc-900 rounded-2xl p-8 max-w-md w-full"
                onclick={(e) => e.stopPropagation()}
            >
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold">QR Code</h3>
                    <button 
                        onclick={closeQr}
                        class="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="bg-black p-6 rounded-xl flex items-center justify-center">
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://vejas.site'}/${link.short_code}`)}&color=ffffff&bgcolor=000000"
                        alt="QR Code"
                        class="w-64 h-64"
                    />
                </div>
                
                <p class="text-sm text-zinc-400 mt-4 text-center">
                    Scan to visit: <span class="text-zinc-200">vejas.site/{link.short_code}</span>
                </p>
            </div>
        </div>
    {/if}
{/if}
