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
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(10, 14, 25, 0.56);
    backdrop-filter: blur(10px);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  }

  .portal-kicker {
    letter-spacing: 0.14em;
    font-size: 0.64rem;
    color: rgba(202, 214, 236, 0.78);
    margin-bottom: 0.2rem;
  }

  .portal-title {
    font-size: 1.1rem;
    letter-spacing: 0.02em;
    margin: 0 0 0.4rem;
    color: rgba(244, 248, 255, 0.96);
  }

  .portal-copy {
    color: rgba(208, 220, 241, 0.9);
    margin-bottom: 0.8rem;
    font-size: 0.92rem;
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
    font-size: 0.64rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(193, 207, 230, 0.78);
  }

  input,
  textarea {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(3, 7, 16, 0.42);
    color: rgba(246, 250, 255, 0.96);
    border-radius: 10px;
    padding: 0.65rem 0.75rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  input:focus,
  textarea:focus {
    border-color: rgba(176, 208, 255, 0.9);
    box-shadow: 0 0 0 2px rgba(176, 208, 255, 0.15);
  }

  button {
    justify-self: start;
    border: 1px solid rgba(255, 255, 255, 0.24);
    color: rgba(248, 250, 255, 0.96);
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 0.58rem 0.9rem;
    letter-spacing: 0.02em;
    font-size: 0.84rem;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.38);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .portal-ok {
    margin-top: 0.6rem;
    color: #b7f7dd;
    font-size: 0.82rem;
  }

  .portal-error {
    margin-top: 0.6rem;
    color: #ffbfd0;
    font-size: 0.82rem;
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
