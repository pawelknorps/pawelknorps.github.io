<script>
  import { createEventDispatcher } from 'svelte';
  import { onDestroy, onMount } from 'svelte';

  export let status = 'idle';
  export let error = '';
  export let turnstileSiteKey = '';
  export let turnstileToken = '';

  const dispatch = createEventDispatcher();
  let name = '';
  let email = '';
  let message = '';
  let website = '';
  let turnstileContainer;
  let turnstileWidgetId = null;
  const formStartedAt = Date.now();

  const ensureTurnstileScript = async () => {
    if (typeof window === 'undefined') return;
    if (window.turnstile) return;
    const existing = document.querySelector('script[data-knorps-turnstile="1"]');
    if (existing) {
      await new Promise((resolve) => existing.addEventListener('load', resolve, { once: true }));
      return;
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.knorpsTurnstile = '1';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const renderTurnstile = () => {
    if (
      typeof window === 'undefined' ||
      !window.turnstile ||
      !turnstileSiteKey ||
      !turnstileContainer ||
      turnstileWidgetId !== null
    ) {
      return;
    }
    turnstileWidgetId = window.turnstile.render(turnstileContainer, {
      sitekey: turnstileSiteKey,
      callback: 'onKnorpsTurnstileToken',
      'expired-callback': 'onKnorpsTurnstileExpired',
      'error-callback': 'onKnorpsTurnstileError',
      theme: 'dark'
    });
  };

  const submit = () => {
    dispatch('submitContact', { name, email, message, website, startedAt: formStartedAt });
  };

  const clear = () => {
    name = '';
    email = '';
    message = '';
    website = '';
    turnstileToken = '';
  };

  $: if (status === 'success') {
    clear();
    if (typeof window !== 'undefined' && window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;
    window.onKnorpsTurnstileToken = (token) => {
      turnstileToken = token || '';
    };
    window.onKnorpsTurnstileExpired = () => {
      turnstileToken = '';
    };
    window.onKnorpsTurnstileError = () => {
      turnstileToken = '';
    };
    if (turnstileSiteKey) {
      try {
        await ensureTurnstileScript();
        renderTurnstile();
      } catch (error) {
        console.warn('Turnstile script failed to load:', error);
      }
    }
  });

  $: if (turnstileSiteKey) {
    renderTurnstile();
  }

  onDestroy(() => {
    if (typeof window === 'undefined') return;
    delete window.onKnorpsTurnstileToken;
    delete window.onKnorpsTurnstileExpired;
    delete window.onKnorpsTurnstileError;
  });
</script>

<section class="contact-portal pointer-events-auto">
  <div class="portal-shell">
    <p class="portal-kicker">CONTACT</p>
    <h3 class="portal-title">Get in touch</h3>
    <p class="portal-copy">
      Send a message and I will get back to you soon.
    </p>

    <form class="portal-form" on:submit|preventDefault={submit}>
      <input type="text" bind:value={website} name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />
      <label>
        <span>Name</span>
        <input
          type="text"
          bind:value={name}
          required
          maxlength="80"
          on:focus={() => dispatch('focusContact', true)}
          on:blur={() => dispatch('focusContact', false)}
        />
      </label>

      <label>
        <span>Email</span>
        <input
          type="email"
          bind:value={email}
          required
          maxlength="160"
          on:focus={() => dispatch('focusContact', true)}
          on:blur={() => dispatch('focusContact', false)}
        />
      </label>

      <label>
        <span>Message</span>
        <textarea
          bind:value={message}
          required
          maxlength="4000"
          rows="5"
          on:focus={() => dispatch('focusContact', true)}
          on:blur={() => dispatch('focusContact', false)}
        ></textarea>
      </label>

      <button type="submit" disabled={status === 'submitting' || (turnstileSiteKey && !turnstileToken)}>
        {status === 'submitting' ? 'Sending...' : 'Send message'}
      </button>
      {#if turnstileSiteKey}
        <div class="cf-turnstile mt-2" bind:this={turnstileContainer}></div>
      {/if}
    </form>

    {#if status === 'success'}
      <p class="portal-ok" role="status">Message sent. Thank you.</p>
    {/if}

    {#if status === 'error'}
      <p class="portal-error" role="alert">{error || 'Could not send your message. Try again.'}</p>
    {/if}
  </div>
</section>

<style>
  .contact-portal {
    position: relative;
    z-index: 25;
    width: 100%;
  }

  .portal-shell {
    border: 1px solid var(--stroke-soft);
    background:
      radial-gradient(circle at 8% 14%, rgba(255, 78, 163, 0.16), transparent 35%),
      radial-gradient(circle at 90% 2%, rgba(143, 214, 255, 0.14), transparent 34%),
      linear-gradient(140deg, rgba(11, 16, 30, 0.78), rgba(9, 14, 28, 0.72));
    backdrop-filter: blur(var(--glass-blur));
    border-radius: var(--radius-md);
    padding: clamp(0.95rem, 1.7vw, 1.2rem);
    box-shadow: var(--shadow-soft);
  }

  .portal-kicker {
    font-family: var(--font-label);
    letter-spacing: 0.08em;
    font-size: var(--step--1);
    color: var(--text-3);
    margin-bottom: 0.2rem;
  }

  .portal-title {
    font-family: var(--font-display);
    font-size: var(--step-2);
    line-height: 1.18;
    letter-spacing: 0.008em;
    font-weight: 600;
    margin: 0 0 0.4rem;
    color: var(--text-1);
  }

  .portal-copy {
    color: var(--text-2);
    margin-bottom: 0.8rem;
    font-size: var(--step-0);
  }

  .portal-form {
    display: grid;
    gap: 0.65rem;
  }

  label {
    display: grid;
    gap: 0.3rem;
  }

  label span {
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  input,
  textarea {
    border: 1px solid var(--stroke-soft);
    background: rgba(3, 7, 16, 0.44);
    color: var(--text-1);
    border-radius: var(--radius-sm);
    padding: 0.65rem 0.75rem;
    outline: transparent;
    font-size: var(--step-0);
    transition: border-color var(--dur-fast) var(--ease-std), box-shadow var(--dur-fast) var(--ease-std), background var(--dur-fast) var(--ease-std);
  }

  input:focus,
  textarea:focus {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(143, 214, 255, 0.24);
    background: rgba(8, 13, 25, 0.62);
  }

  button {
    justify-self: start;
    border: 1px solid rgba(255, 78, 163, 0.42);
    color: #ffe8f4;
    background: linear-gradient(135deg, rgba(255, 78, 163, 0.28), rgba(125, 90, 255, 0.18));
    border-radius: var(--radius-sm);
    padding: 0.58rem 0.9rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-family: var(--font-label);
    font-size: var(--step--1);
    transition: background var(--dur-fast) var(--ease-std), border-color var(--dur-fast) var(--ease-std), transform var(--dur-fast) var(--ease-emph);
  }

  button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(255, 78, 163, 0.45), rgba(106, 150, 255, 0.26));
    border-color: rgba(255, 78, 163, 0.7);
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .portal-ok {
    margin-top: 0.6rem;
    color: var(--accent-mint);
    font-size: var(--step--1);
  }

  .portal-error {
    margin-top: 0.6rem;
    color: #ffc4d8;
    font-size: var(--step--1);
  }

  .hp {
    position: absolute;
    left: -9999px;
    opacity: 0;
    pointer-events: none;
  }

  :global(.cf-turnstile) {
    min-height: 65px;
  }
  
</style>
