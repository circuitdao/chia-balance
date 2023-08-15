<script>
  import {
    fns,
    AppShell,
    Navbar,
    Header,
    Title,
    Divider,
    Container,
  } from "@svelteuidev/core";
  import HeadContent from "./HeadContent.svelte";
  import { Input, InputWrapper } from "@svelteuidev/core";

  import { SvelteUIProvider } from "@svelteuidev/core";
</script>

<SvelteUIProvider>
  <Container>
    <HeadContent />

    <slot>
      <InputWrapper
        id="pubkey"
        label="Your master public key"
        description="Enter your public key and we'll derive observable addresses and fetch the balances for you. It takes a few seconds."
      >
        <Input
          name="master_pubkey"
          value=""
          placeholder="insert your master public key, derivations will be done in the browser"
        />
      </InputWrapper>
    </slot>
  </Container>
</SvelteUIProvider>
