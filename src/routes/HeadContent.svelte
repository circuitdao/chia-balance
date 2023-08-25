<script lang="ts">
  import {
    Anchor,
    Button,
    Container,
    Divider,
    Seo,
    SimpleGrid,
    Text,
    Title,
  } from "@svelteuidev/core";
</script>

<Seo
  title="Chia address balance"
  description="Check balance of your Chia address, works for CATs and XCH."
  canonical="/"
/>
<SimpleGrid css={{ mt: 10 }} cols={2}>
  <Title
    variant="gradient"
    gradient={{ from: "dark", to: "lime", deg: 305 }}
    order={1}>Chia address balance</Title
  >
  <div class="corner">
    Part of <Anchor external={true} href="https://circuitdao.com"
      >CircuitDAO</Anchor
    > community tools.

    <Anchor external={true} href="https://github.com/circuitdao/chia-balance"
      >Contribute</Anchor
    >
  </div>
</SimpleGrid>
<Text color="gray" css={{ mt: 10 }}
  >A convenient way to check your wallet balance for CATs and XCH. Either if
  your wallet is struggling to sync, you suspect balance is not correct or just
  want to quickly see if you got any airdrops.
</Text>

<Divider override={{ mb: 50 }} />

<style>
  .corner {
    text-align: right;
    vertical-align: middle;
    align-items: end;
  }
</style>
