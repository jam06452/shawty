<script lang="ts">
    export let data;
    import Button from '$lib/components/ui/button/button.svelte';
    import { onMount } from 'svelte';

    let securityElement: HTMLElement | null = null;
    let hackElement: HTMLElement | null = null;
    let hoverListener: ((e: MouseEvent) => void) | null = null;
    let scrambleInterval: ReturnType<typeof setInterval> | null = null;

    const startAnimations = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const originalText = 'Secure';
        securityElement = document.getElementById('securitytext');
        
        if (securityElement) {
            const scramble = () => {
                let iteration = 0;
                const interval = setInterval(() => {
                    if (securityElement) {
                        securityElement.innerText = originalText
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
                        }
                        iteration += 1 / 3;
                    }
                }, 30);
            };
            
            scramble();
            
            const parent = securityElement.parentElement;
            if (parent) {
                hoverListener = () => scramble();
                parent.addEventListener('mouseenter', hoverListener);
            }
        }

        hackElement = document.getElementById('hacktext');
        const rhymingWords = ['hack', 'back', 'pack', 'stack', 'track', 'snack', 'slack', 'crack'];
        let currentIndex = 0;
        
        if (hackElement) {
            const scrambleToNext = () => {
                const nextIndex = (currentIndex + 1) % rhymingWords.length;
                const targetWord = rhymingWords[nextIndex];
                let iteration = 0;
                
                const interval = setInterval(() => {
                    if (hackElement) {
                        hackElement.innerText = targetWord
                            .split('')
                            .map((char, index) => {
                                if (index < iteration) {
                                    return targetWord[index];
                                }
                                return chars[Math.floor(Math.random() * chars.length)].toLowerCase();
                            })
                            .join('');
                        
                        if (iteration >= targetWord.length) {
                            clearInterval(interval);
                            currentIndex = nextIndex;
                        }
                        iteration += 1 / 3;
                    }
                }, 50);
            };

            scrambleToNext();
            scrambleInterval = setInterval(scrambleToNext, 3000);
        }
    };

    onMount(() => {
        // Defer animations to avoid blocking initial render
        const timer = setTimeout(startAnimations, 0);
        
        return () => {
            clearTimeout(timer);
            if (scrambleInterval) {
                clearInterval(scrambleInterval);
            }
            if (hoverListener && securityElement?.parentElement) {
                securityElement.parentElement.removeEventListener('mouseenter', hoverListener);
            }
        };
    });
</script>

<div class="relative overflow-hidden">
    <!-- Hero Section -->
    <div class="relative px-6 py-14 lg:py-32">
        <!-- Background gradient -->
        <div class="absolute inset-0 -z-10 bg-linear-to-br from-blue-500 via-transparent to-purple-500/50"></div>
        
        <div class="mx-auto max-w-5xl text-center space-y-8">
        <!-- Hero Text -->
            <h1 class="text-5xl lg:text-7xl font-bold tracking-tight">
                <span class="bg-linear-to-r from-black to-zinc-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Short links,
                </span>
                <br />
                <span class="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    infinite possibilities
                </span>
            </h1>

            <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
                Create branded short links, track clicks, and share QR codes. Built for Hack Clubbers.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {#if data?.user}
                    <Button href="/dashboard" variant="default" size="lg">
                        Go to Dashboard →
                    </Button>
                {:else}
                    <Button href="/login" variant="default" size="lg">
                        Get Started For Free
                    </Button>
                {/if}
                <Button href="#features" variant="outline" size="lg">
                    See Features
                </Button>
            </div>

            <!-- Stats -->
                <div class="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    <div class="space-y-1">
                        <p class="text-3xl font-bold">∞</p>
                        <p class="text-sm dark:text-zinc-400 text-zinc-700">Links Created</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-3xl font-bold">⚡</p>
                        <p class="text-sm dark:text-zinc-400 text-zinc-700">Lightning Fast</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-3xl font-bold">🔒</p>
                        <p id="securitytext" class="text-sm dark:text-zinc-400 text-zinc-700">Secure</p>
                    </div>
                </div>
        </div>
    </div>

    <!-- Demo Section -->
    <div class="px-6 py-6">
        <div class="mx-auto max-w-4xl">
            <div class="bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-zinc-800">
                <div class="flex items-center gap-2 mb-6">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                <div class="space-y-4">
                    <div class="flex gap-3">
                        <input
                            value="https://hackclub.com/some/really/long/url/that/nobody/wants/to/type"
                            disabled
                            class="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-zinc-400"
                        />
                        <button disabled class="px-6 py-3 rounded-xl bg-white text-zinc-900 font-medium">
                            Shorten
                        </button>
                    </div>
                    
                    <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <p class="text-emerald-400 mb-2">✨ Shortened successfully!</p>
                        <p class="text-2xl font-mono text-white">www.shawty.app/<span id="hacktext">hack</span></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="px-6 py-20">
        <div class="mx-auto max-w-5xl">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4">Everything you need</h2>
                <p class="text-xl text-zinc-400">Powerful features, simple interface</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Instant Shortening</h3>
                    <p class="text-zinc-400">Transform long URLs into short, shareable links in seconds.</p>
                </div>

                <!-- Feature 2 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-400"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8"/><circle cx="12" cy="12" r="1"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">QR Codes</h3>
                    <p class="text-zinc-400">Generate QR codes for any link with one click.</p>
                </div>

                <!-- Feature 3 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Click Tracking</h3>
                    <p class="text-zinc-400">Monitor how many times your links are clicked.</p>
                </div>

                <!-- Feature 4 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-orange-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Secure</h3>
                    <p class="text-zinc-400">Authenticated with Hack Club SSO for security.</p>
                </div>

                <!-- Feature 5 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-400"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Analytics for each link</h3>
                    <p class="text-zinc-400">See analytics for every link you create with great detail.</p>
                </div>

                <!-- Feature 6 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-cyan-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Privacy First</h3>
                    <p class="text-zinc-400">Your data stays yours. No tracking, no ads.</p>
                </div>
            </div>
        </div>
    </div>

<div id="analytics" class="px-6 py-20">
        <div class="mx-auto max-w-5xl">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4">Analytics you care about</h2>
                <p class="text-xl text-zinc-400">Easy to read data included!</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- User Location -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">User Location</h3>
                    <p class="text-zinc-400">See where your users are coming from with (not so) detailed location data.</p>
                </div>

                <!-- Feature 2 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="17" x2="22" y2="17"/><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Devices</h3>
                    <p class="text-zinc-400">See what devices your users are using to access your sites.</p>
                </div>

                <!-- Feature 3 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-lime-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Operating systems</h3>
                    <p class="text-zinc-400">See what operating system is most popular among your users.</p>
                </div>

                <!-- Feature 4 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-rose-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Secure</h3>
                    <p class="text-zinc-400">Nobody can see your link data except you.</p>
                </div>

                <!-- Feature 5 -->
                <div class="dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-cyan-400"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Analytics for each link</h3>
                    <p class="text-zinc-400">See analytics for every link you create with great detail.</p>
                </div>

                <!-- Feature 6 -->
                <div class="border-gray-100 dark:bg-zinc-900 rounded-2xl p-8 border dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors">
                    <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Privacy First</h3>
                    <p class="text-zinc-400">Only you can see the analytics of your links.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- CTA Section -->
    <div class="px-6 py-20">
        <div class="mx-auto max-w-4xl">
            <div class="bg-linear-to-tr bg-transparent from-sky-500/50 to-purple-500/40 overflow-clip rounded-3xl p-12 text-center border border-gray-300 dark:border-zinc-800">
                <h2 class="text-4xl font-bold mb-4">Ready to get started?</h2>
                <p class="text-xl dark:text-gray-300 mb-8">Join Hack Clubbers already using Shawty</p>
                {#if !data?.user}
                    <Button href="/login" variant="default" class="">
                        Log in with Hack Club →
                    </Button>
                {:else}
                    <a href="/dashboard" class="inline-block px-8 py-4 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-200 text-lg shadow-lg hover:shadow-xl transition-all">
                        Go to Dashboard →
                    </a>
                {/if}
            </div>
        </div>
    </div>
</div>
