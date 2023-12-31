<script lang="ts">
  import KeyDerivationWorker from "$lib/worker?worker";
  import {
    Box,
    Button,
    Container,
    Flex,
    Grid,
    InputWrapper,
    Loader,
    NumberInput,
    Progress,
    Space,
    Card,
    SvelteUIProvider,
    Text,
    TextInput,
    Title,
    Image,
    Tooltip,
    Group,
    Center,
    Divider,
    Anchor,
    Input,
    Badge,
    Modal,
  } from "@svelteuidev/core";
  import { toHex } from "chia-bls";
  import { onMount } from "svelte";
  import bech32 from "../lib/bech32";
  import { getSQLtoFetchCATS, getSQLtoFetchXCH } from "../lib/mojonode_sql";
  import TAILS from "../lib/tails";
  import HeadContent from "./HeadContent.svelte";
  let worker: Worker;

  async function fetchBalance(puzzle_hashes: string[]) {
    const formatted_phs = puzzle_hashes.map((v) => `'\\x${v}',`);
    const query = getSQLtoFetchXCH(formatted_phs);
    const cat_query = getSQLtoFetchCATS(formatted_phs);
    const req_settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    };
    const cat_req_settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: cat_query,
      }),
    };
    const res = await fetch(`https://api.mojonode.com/query`, req_settings);
    const cat_res = await fetch(
      `https://api.mojonode.com/query`,
      cat_req_settings
    );
    const balance = await res.json();
    const cat_balance = await cat_res.json();

    const balances = {
      XCH: {
        amount: balance.data.amount[0],
        coins: balance.data.number_of_coins[0],
      },
      CATs: {},
    };
    for (let i = 0; i < cat_balance.data.amount.length; i++) {
      let tail_name = cat_balance.data.tail[i];
      if (!tail_name || tail_name === undefined) continue;
      let tail_info = TAILS[tail_name];
      if (!tail_info) {
        tail_info = { code: truncate(tail_name), name: tail_name };
      }
      balances["CATs"][tail_name] = {
        amount: cat_balance.data.amount[i].toFixed(1),
        coins: cat_balance.data.number_of_coins[i],
        tail_info: tail_info,
      };
    }
    return balances;
  }

  onMount(() => {
    console.log("setting up worker");
    worker = new KeyDerivationWorker({ type: "module" });
    worker.onmessage = async (messageEvent) => {
      const data = messageEvent.data;
      console.log("got message", data);
      if (data.puzzleHashes) {
        if (data.error) {
          error = data.error;
        } else {
          fetching = true;
          balance = await fetchBalance(data.puzzleHashes);
          console.log("Got back balance", balance);
          fetching = false;
        }
      }
      if (data.progress) {
        console.log("progress update");
        progress = (data.progress / data.count) * 100;
      }
    };
  });
  function truncate(str) {
    return str.slice(0, 4) + "..." + str.slice(-4, -1);
  }
  const mobileWidth = {
    width: "100%",
  };

  let error = null;
  let puzzleHashes = [];
  let fetching = false;
  let progress: Number = null;
  let balance = null;
  let public_key: string = "";
  let derivations_count = 500;
  let helpOpened = false;
  async function onPKChanged() {
    if (worker) progress = 0;
    console.log("pk changed", public_key);
    balance = null;
    if (public_key.startsWith("xch")) {
      // puzzle hash
      fetching = true;
      console.log("Decoding bech", public_key);
      const { hrp, data } = bech32.decode(public_key, "bech32m");
      const puzzle_hash = toHex(bech32.convertbits(data, 5, 8, false));

      console.log("Got back data", data);
      console.log("Puzhash", puzzle_hash);
      if (puzzle_hash) balance = await fetchBalance([puzzle_hash]);
      else error = "Invalid XCH address";
    } else {
      // master public key
      worker.postMessage({
        publicKeyText: public_key,
        rowCountLimit: derivations_count,
      });
    }
  }
  function showModal() {
    helpOpened = true;
  }
</script>

<SvelteUIProvider withNormalizeCSS withGlobalStyles>
  <Container>
    <HeadContent />
    <slot>
      <Modal
        size="md"
        opened={helpOpened}
        on:close={() => (helpOpened = false)}
        centered
      >
        <Title override={{ mb: 20 }} order={2}
          >How to find master public key?</Title
        >
        <Text size="xl" align="center">1.</Text>
        <Image
          override={{ m: 5, border: "1px solid gray" }}
          src={"./wallet_keys.png"}
          caption="Start the wallet, if you don't see this list of keys, logout from your wallet first. Click on three dots and click on DETAILS."
        />
        <Space h="xl" />
        <Space h="xl" />
        <Text size="xl" align="center">2.</Text>
        <Image
          src={"./key_details.png"}
          override={{ m: 5, border: "1px solid gray" }}
          caption="Copy and paste the first value of the key"
        />

        <Title css={{ mt: 100, mb: 20 }} order={2}
          >What to enter for number of derivations required?</Title
        >
        <Image
          src={"./derivation_index.png"}
          override={{ border: "1px solid gray" }}
          caption="Open your wallet and select a key. A page with your balance and other info will show, find the number show in the screenshot. You need to enter at least this many into derivation input."
        />
      </Modal>
      <Grid cols={24} align="flex-end">
        <Grid.Col span={20} override={{ minHeight: 80 }}>
          <Flex gap="xs" justify="center" align="flex-end">
            <InputWrapper
              id="pubkey"
              required
              label="Your master public key"
              size="md"
              {error}
              description="Enter your public key or an XCH address. Master public key derivations will be done in the browser. It should take max 1 minute."
            >
              <TextInput
                name="master_pubkey"
                bind:value={public_key}
                on:change={onPKChanged}
                size="md"
                placeholder="Insert your master public key or an xch address"
              />
            </InputWrapper>
            <Button on:click={onPKChanged} size="md">Go</Button>
          </Flex>
          <Badge
            css={{ cursor: "pointer" }}
            color="gray"
            on:click={showModal}
            size="xs"
            >How to find master public key and number of derivations?</Badge
          >
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            color="gray"
            bind:value={derivations_count}
            override={{ mb: 20 }}
            size="sm"
            label="# of derivations"
            hideControls
            placeholder="Number of dervations"
          />
        </Grid.Col>
      </Grid>
      <Container size="xs" override={{ px: 10, mt: 50 }}>
        <Center>
          <Space h="xl" />
          {#if balance}
            <Card css={{ width: "100%" }} shadow="xl" padding="xl">
              <Card.Section first>
                <Space h="xl" />
                <Title align="center" order={1}
                  >{(balance["XCH"].amount / 1000000000000).toFixed(1)} XCH</Title
                >
                <Text align="center" size="xs"
                  >{balance["XCH"].coins} unspent XCH coins</Text
                >
                <Box
                  css={{
                    textAlign: "center",
                    padding: "$10",
                    borderRadius: "$md",
                    cursor: "pointer",
                  }}
                >
                  {#each Object.entries(balance["CATs"]) as [tail, cat_balance]}
                    <Group
                      grow
                      spacing="lg"
                      override={{ borderBottom: "1px dashed #eee" }}
                    >
                      <Tooltip label={cat_balance.tail_info.name}>
                        <Text
                          size="xl"
                          align="left"
                          override={{ width: 100, mt: 10 }}
                          color="blue">{cat_balance.tail_info.code}</Text
                        >
                      </Tooltip>
                      <Tooltip label="Unspent CAT coins: {cat_balance.coins}">
                        <Text size="xl" align="right"
                          >{(cat_balance.amount / 1000).toFixed(1)}</Text
                        ></Tooltip
                      >
                    </Group>
                  {/each}
                </Box>
              </Card.Section>
              <Divider />
              <Text color="gray" size="xs"
                >&ast; Mojonode only includes blocks that have enough
                confirmations, so you might not see balance for coins you
                received in last 20 blocks from peak.</Text
              >
            </Card>
          {:else if fetching}
            <Loader color="green" />
            <Text size="md">Fetching from Mojonode</Text>
          {:else if progress}
            <Container override={{ width: "100%" }}>
              <Progress striped mt="xl" size="xl" value={progress} />
            </Container>
          {/if}
        </Center>
      </Container>
    </slot>
  </Container>
</SvelteUIProvider>
