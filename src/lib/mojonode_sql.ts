export function getSQLtoFetchCATS(formatted_hashes: string[]) {
  return `
select 
-- second parameter of CAT_v2.clsp puzzle is TAIL, so we take it here (indexing starts from 0)
parent.puzzle->'a'->>1 as TAIL,
-- we sum the amount of all unspent coins we fetch
sum(amount)::bigint as amount,
-- we also provide the count of all coins for convenience
count(*) as number_of_coins
from chia.coin_spends parent  
-- here we join with coin_records to get unspent coins 
-- (we need to also use block name here due to how these tables are distributed in the cluster)          
inner join chia.coin_records coin on coin.parent_coin_name = parent.name 
                                     and parent.spent_block_name = coin.confirmed_block_name 

where 
      -- first we want to find all coins that have a hint to given puzzle hashes 
      coin.hint in (${formatted_hashes})
      -- they should be unspent
      and coin.is_spent=false 
      -- their parent puzzle should be a CAT puzzle, 'm' stands for puzzle module that is returned by uncurry function
      -- there's also 'a' that contains curried arguments
      and parent.puzzle->>'m'='37bef360ee858133b69d595a906dc45d01af50379dad515eb9518abb7c1d2a7a' 
      group by TAIL


`
}

export function getSQLtoFetchXCH(formatted_hashes: string[]) {
  return `select sum(amount)::bigint as amount, 
                   count(*) as number_of_coins 
            from coin_records 
            where puzzle_hash in (${formatted_hashes}) and is_spent=false;`
}

