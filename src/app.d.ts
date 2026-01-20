// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string;
				first_name?: string;
				last_name?: string;
			};
		}
	}

	const __GIT_COMMIT_HASH__: string;
	const __GITHUB_REPO_URL__: string;
}

export {};