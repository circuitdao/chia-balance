<script lang="ts">
  import {
    Container,
    InputWrapper,
    Loader,
    Progress,
    Space,
    SvelteUIProvider,
    Text,
    TextInput,
    Title,
    Tooltip,
  } from "@svelteuidev/core";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import keyDerivationWorkerURL from "../lib/worker?url";
  import HeadContent from "./HeadContent.svelte";
  import { getSQLtoFetchXCH, getSQLtoFetchCATS } from "../lib/mojonode_sql";
  import TAILS from "../lib/tails";
  import bech32 from "../lib/bech32";
  import { toHex } from "chia-bls";
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
      const tail_name = cat_balance.data.tail[i];
      const tail_info = TAILS[tail_name];
      balances["CATs"][tail_name] = {
        amount: cat_balance.data.amount[i],
        coins: cat_balance.data.number_of_coins[i],
        tail_info: tail_info,
      };
    }
    return balances;
  }

  onMount(() => {
    worker = new Worker(keyDerivationWorkerURL, { type: "module" });
    worker.onmessage = async (messageEvent) => {
      const data = messageEvent.data;
      if (data.puzzleHashes) {
        if (data.error) {
          error.set(data.error);
        } else {
          fetching = true;
          balance = await fetchBalance(data.puzzleHashes);
          console.log("Got back balance", balance);
          fetching = false;
        }
      }
      if (data.numberOfHashes) {
        progress = (data.count / data.numberOfHashes) * 100;
      }
    };
  });

  let error = writable([]);
  let puzzleHashes = [];
  let fetching = false;
  let progress = null;
  let balance = null;
  let public_key: string = "";

  async function onPKChanged() {
    if (worker) progress = 0;
    console.log("pk changed", public_key);
    if (public_key.startsWith("xch")) {
      // puzzle hash
      fetching = true;
      console.log("Decoding bech", public_key);
      const { hrp, data } = bech32.decode(public_key, "bech32m");
      const puzzle_hash = toHex(bech32.convertbits(data, 5, 8, false));

      console.log("Got back data", data);
      console.log("Puzhash", puzzle_hash);
      if (puzzle_hash) balance = await fetchBalance([puzzle_hash]);
      else error.set("bad address");
    } else {
      // master public key
      worker.postMessage({
        publicKeyText: public_key,
        rowCountLimit: 0,
      });
    }
  }
</script>

<SvelteUIProvider>
  <Container>
    <HeadContent />

    <slot>
      <InputWrapper
        id="pubkey"
        label="Your master public key"
        size="xl"
        description="Enter your public key or an XCH address. Master public key derivations will be done in the browser. It should take max 1 minute."
      >
        <TextInput
          name="master_pubkey"
          bind:value={public_key}
          on:change={onPKChanged}
          placeholder="insert your master public key or an xch address"
        />
      </InputWrapper>
      <Container size="md" override={{ px: "md" }}>
        <Space h="xl" />
        {#if balance}
          <Title order={2}>XCH</Title>
          <Title order={3}>
            Your balance is{" "}<br />
            <Text color="blue" inherit component="span">
              {balance["XCH"].amount / 1000000000000} XCH
            </Text>
          </Title>
          <br /> <br />
          <Title order={3}>
            You have{" "}<br />
            <Text color="blue" inherit component="span">
              {balance["XCH"].coins} unspent coins.
            </Text>
          </Title>
          <hr />

          <Title order={2}>CATs</Title>
          {#each Object.entries(balance["CATs"]) as [tail, cat_balance]}
            <ul>
              <li>
                {#if cat_balance.tail_info}
                  <Tooltip label={cat_balance.tail_info.name}>
                    <Text color="blue">{cat_balance.tail_info.code}</Text>
                  </Tooltip>
                {:else}
                  {tail}:
                {/if}
                {cat_balance.amount / 1000} (number of coins: {cat_balance.coins})
              </li>
            </ul>
          {/each}
        {:else if fetching}
          <Loader color="green" />
          <p>Fetching from Mojonode</p>
        {:else if progress}
          <Container>
            <Progress
              size="xl"
              label="Deriving addressess..."
              value={progress}
            />
          </Container>
        {/if}
      </Container>
    </slot>
  </Container>
</SvelteUIProvider>
