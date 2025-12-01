import {
  generateDeterministicIdentityKeyPair,
  encryptMessage,
  decryptMessage,
  deriveSharedSecret,
} from './ecc-ecdh.ts';
import { toHex } from './crypto.ts';

async function runTests() {
  console.log('=== ECC ECDH Encryption Test ===\n');

  // Seeds
  const aliceSeed = new TextEncoder().encode('alice_super_secret_seed');
  const bobSeed = new TextEncoder().encode('bob_ultra_secret_seed');

  // Generate deterministic keypairs
  const alice = await generateDeterministicIdentityKeyPair(aliceSeed);
  const bob = await generateDeterministicIdentityKeyPair(bobSeed);

  console.log('Alice SK:', toHex(alice.privateKeyEcdh));
  console.log('Alice PK:', toHex(alice.publicKeyEcdh));
  console.log('Bob   SK:', toHex(bob.privateKeyEcdh));
  console.log('Bob   PK:', toHex(bob.publicKeyEcdh));
  console.log('\n');

  // TEST 1: Shared Secret Match
  const sharedAB = deriveSharedSecret(alice.privateKeyEcdh, bob.publicKeyEcdh);
  const sharedBA = deriveSharedSecret(bob.privateKeyEcdh, alice.publicKeyEcdh);
  console.log(
    'Shared match:',
    toHex((sharedAB)) ===
      toHex((sharedBA))
  );

  // TEST 2: Alice encrypts → Bob decrypts
  const msgAtoB = "Hello Bob, it's Alice!";
  const encryptedAtoB = await encryptMessage(
    alice.privateKeyEcdh,
    bob.publicKeyEcdh,
    msgAtoB
  );
  console.log('Encrypted A→B:', encryptedAtoB);

  const decryptedAtoB = await decryptMessage(
    alice.privateKeyEcdh,
    bob.publicKeyEcdh,
    encryptedAtoB
  );

  console.log('Decrypted A→B:', decryptedAtoB);
  console.log('Match:', decryptedAtoB === msgAtoB, '\n');

  // TEST 3: Bob encrypts → Alice decrypts
  const msgBtoA = 'Hi Alice, message received!';
  const encryptedBtoA = await encryptMessage(
    bob.privateKeyEcdh,
    alice.publicKeyEcdh,
    msgBtoA
  );
  console.log('Encrypted B→A:', encryptedBtoA);

  const decryptedBtoA = await decryptMessage(
    alice.privateKeyEcdh,
    bob.publicKeyEcdh,
    encryptedBtoA
  );

  console.log('Decrypted B→A:', decryptedBtoA);
  console.log('Match:', decryptedBtoA === msgBtoA, '\n');

  // TEST 4: Invalid decrypt (wrong public key)
  console.log('Testing incorrect key decrypt (should error)...');
  const wrongPk = alice.publicKeyEcdh; // purposely wrong

  const wrongDecrypt = await decryptMessage(
    bob.privateKeyEcdh,
    wrongPk, // wrong key pair mapping
    encryptedAtoB
  );

  console.log('Result wrong decrypt:', wrongDecrypt);

  console.log('\n=== Test Complete ===');
}

// run
runTests().catch(console.error);
