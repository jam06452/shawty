<script>
    import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center bg-black text-white">
    <div class="text-center space-y-4 p-8">
        <div class="text-8xl font-bold text-red-500">{$page.status}</div>
        <h1 class="text-3xl font-bold">
            {#if $page.status === 404}
                Page Not Found
            {:else if $page.status === 403}
                Forbidden
            {:else}
                Something went wrong
            {/if}
        </h1>
        <p class="text-xl text-zinc-400 max-w-md">
            {$page.error?.message || 'An unexpected error occurred'}
        </p>
        <div class="pt-4">
            <a 
                href="/" 
                class="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
            >
                Go Home
            </a>
        </div>
    </div>
</div>
