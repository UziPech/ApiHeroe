// repositories/battleRepository.js
import fs from 'fs-extra';
const filePath = './battles.json';

async function getBattles() {
  try {
    return await fs.readJson(filePath);
  } catch {
    return [];
  }
}

async function saveBattle(battle) {
  const battles = await getBattles();
  battles.push(battle);
  await fs.writeJson(filePath, battles);
}

export default {
  getBattles,
  saveBattle,
};
