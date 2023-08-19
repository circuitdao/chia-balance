export function getSQLtoFetchCATS(formatted_hashes: string[]) {
  return `select parent.puzzle->'a'->>1 as TAIL, 
                   sum(amount)::bigint as amount,
                   count(*) as number_of_coins
            from chia.coin_spends parent  
            inner join chia.coin_records coin on coin.parent_coin_name = parent.name 
                                             and parent.spent_block_name = coin.confirmed_block_name 
            inner join lateral (select decode(el->3->>0, 'hex') as hint from jsonb_array_elements(parent.conditions) as el where el->>0='33') condition_filter on true
    where coin.hint in (${formatted_hashes})  
    and coin.is_spent=false 
    and parent.puzzle->>'m'='37bef360ee858133b69d595a906dc45d01af50379dad515eb9518abb7c1d2a7a' 
    and condition_filter.hint = coin.hint group by TAIL;`
}

export function getSQLtoFetchXCH(formatted_hashes: string[]) {
  return `select sum(amount)::bigint as amount, 
                   count(*) as number_of_coins 
            from coin_records 
            where puzzle_hash in (${formatted_hashes}) and is_spent=false;`
}

