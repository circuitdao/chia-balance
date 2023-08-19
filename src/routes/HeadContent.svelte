<script lang="ts">
  import {
    Anchor,
    Button,
    Container,
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
<SimpleGrid cols={2}>
  <Title
    variant="gradient"
    gradient={{ from: "dark", to: "lime", deg: 305 }}
    order={1}>Chia address balance</Title
  >
  <div class="corner">
    <Anchor to="https://github.com/circuitdao/chia-balance">Contribute</Anchor>
  </div>
</SimpleGrid>

<style>
  .corner {
    text-align: right;
    vertical-align: middle;
    align-items: end;
  }
</style>
