<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let displayStatus = $state($page.status.toString());

    onMount(() => {
        const chars = '0123456789!@#$%^&*';
        const originalText = $page.status.toString();
        
        const scramble = () => {
            let iteration = 0;
            const interval = setInterval(() => {
                displayStatus = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');
                
                if (iteration >= originalText.length) {
                    clearInterval(interval);
                    // Restart the scramble after a delay
                    setTimeout(() => {
                        scramble();
                    }, 3000);
                }
                iteration += 1 / 6;
            }, 100);
        };
        
        // Initial scramble on load
        scramble();
    });
</script>

<div class="flex min-h-screen items-center justify-center bg-white dark:bg-black">
    <div class="text-center space-y-4 p-8">
        <div class="text-8xl font-bold">{displayStatus}</div>
        <h1 class="text-3xl font-bold text-black dark:text-white">
            {#if $page.status === 404}
                Page Not Found
            {:else if $page.status === 403}
                Forbidden
            {:else}
                Something went wrong
            {/if}
        </h1>
        <p class="text-xl text-zinc-600 dark:text-zinc-400 max-w-md">
            {$page.error?.message || 'An unexpected error occurred'}
        </p>
        <div class="pt-4">
            <a 
                href="/" 
                class="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
                Go Home
            </a>
        </div>
    </div>
</div>
