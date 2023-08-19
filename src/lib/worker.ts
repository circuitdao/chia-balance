import { Program } from "clvm-lib";
import { calculateSyntheticPublicKey, derivePublicKeyPath } from "./keys";
import { JacobianPoint } from "chia-bls";
const standardTransaction = Program.deserializeHex(
  "ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080"
);

import random100 from "./test_addresses";
function calcPuzzleHashes(publicKeyText: string, rowCountLimit: Number): string[] {
  const publicKey = JacobianPoint.fromHexG1(publicKeyText);
  const puzzleHashes: Array<string> = [];

  const intermediate_unhardened = derivePublicKeyPath(publicKey, [12381, 8444, 2]);
  const numberOfHashes = rowCountLimit === 0 ? 100 : 100;
  for (let i = rowCountLimit; i < rowCountLimit + numberOfHashes; i++) {
    if (i % 50 === 0)
      self.postMessage({ numberOfHashes, count: i - rowCountLimit });
    const final_pk = derivePublicKeyPath(intermediate_unhardened, [i]);
    puzzleHashes.push(standardTransaction.curry([Program.fromJacobianPoint(calculateSyntheticPublicKey(final_pk, Program.deserializeHex("ff0980").hash()))]).hashHex());

  }
  return puzzleHashes;
}

self.onmessage = async ({ data: { publicKeyText, rowCountLimit } }) => {
  console.log("Got a message to process", publicKeyText, rowCountLimit);
  if (!publicKeyText || rowCountLimit < 0) return;
  if (!publicKeyText || publicKeyText.length !== 96) {
    self.postMessage({ error: "Ups... Public key should be 96 characters long." });
  } else {
    if (publicKeyText === "a44b7cee1130f2420e70cd8c9b7c1170364356f13605db25903bbf7812b4dc96e71992a0137834aa3a46667d20b4008f") {
      setTimeout(() => {
        self.postMessage({ puzzleHashes: random100 });
      }, 500);
    } else {
      try {
        const puzzleHashes = calcPuzzleHashes(publicKeyText, rowCountLimit);
        self.postMessage({ numberOfHashes: puzzleHashes.length, count: puzzleHashes.length });
        self.postMessage({ puzzleHashes });
      } catch (e) {
        self.postMessage({ puzzleHashes: [], error: "Invalid public key." });
      }
    }
  }
};
