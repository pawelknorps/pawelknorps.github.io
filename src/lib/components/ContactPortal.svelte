<script>
  import { createEventDispatcher } from 'svelte';

  export let status = 'idle';
  export let error = '';

  const dispatch = createEventDispatcher();
  let name = '';
  let email = '';
  let message = '';

  const submit = () => {
    dispatch('submitContact', { name, email, message });
  };

  const clear = () => {
    name = '';
    email = '';
    message = '';
  };

  $: if (status === 'success') {
    clear();
  }
</script>

<section class="contact-portal pointer-events-auto mt-24 mb-24 w-full max-w-3xl xl:max-w-none xl:w-1/2 2xl:w-2/3">
  <div class="portal-shell">
    <p class="portal-kicker">TRANSMISSION NODE</p>
    <h3 class="portal-title">Contact Rift</h3>
    <p class="portal-copy">
      Open a channel. As you type, the sphere focuses into transmission mode.
    </p>

    <form class="portal-form" on:submit|preventDefault={submit}>
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

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Transmit'}
      </button>
    </form>

    {#if status === 'success'}
      <p class="portal-ok">Signal received. You should hear back soon.</p>
    {/if}

    {#if status === 'error'}
      <p class="portal-error">{error || 'Transmission failed. Try again.'}</p>
    {/if}
  </div>
</section>

<style>
  .contact-portal {
    position: relative;
    z-index: 25;
  }

  .portal-shell {
    border: 1px solid rgba(255, 0, 128, 0.45);
    background:
      radial-gradient(circle at 20% 10%, rgba(255, 0, 128, 0.22), transparent 45%),
      radial-gradient(circle at 90% 90%, rgba(0, 142, 255, 0.22), transparent 42%),
      rgba(6, 6, 14, 0.68);
    backdrop-filter: blur(14px);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.08) inset,
      0 22px 56px rgba(0, 0, 0, 0.48);
    transform: skewY(-0.6deg);
  }

  .portal-kicker {
    letter-spacing: 0.2em;
    font-size: 0.68rem;
    color: #ff7ac9;
    margin-bottom: 0.25rem;
  }

  .portal-title {
    font-size: 1.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0 0 0.4rem;
    color: #fff;
  }

  .portal-copy {
    color: #c7d0e2;
    margin-bottom: 1rem;
  }

  .portal-form {
    display: grid;
    gap: 0.8rem;
  }

  label {
    display: grid;
    gap: 0.3rem;
  }

  label span {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #9cb0d8;
  }

  input,
  textarea {
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(0, 0, 0, 0.38);
    color: #fff;
    border-radius: 12px;
    padding: 0.75rem 0.85rem;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }

  input:focus,
  textarea:focus {
    border-color: rgba(255, 0, 128, 0.8);
    box-shadow: 0 0 0 2px rgba(255, 0, 128, 0.2);
    transform: translateY(-1px);
  }

  button {
    justify-self: start;
    border: 1px solid rgba(255, 0, 128, 0.75);
    color: #fff;
    background: linear-gradient(135deg, rgba(255, 0, 128, 0.35), rgba(93, 76, 255, 0.35));
    border-radius: 999px;
    padding: 0.7rem 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 24px rgba(255, 0, 128, 0.35);
  }

  .portal-ok {
    margin-top: 0.9rem;
    color: #9fffd2;
    font-size: 0.9rem;
  }

  .portal-error {
    margin-top: 0.9rem;
    color: #ff9fbc;
    font-size: 0.9rem;
  }
  
  @media (max-width: 900px) {
    .portal-shell {
      transform: none;
    }
  }
</style>
