class StoryTeller {
  async profess(message) {
    const stories = [
      "Brave knight who fought dragons came to the village and saved the princess.",
      "Wise wizard who cast spells saved the kingdom from the dark lord.",
      "Cunning thief stole from the rich and gave to the poor.",
      "Powerful sorcerer summoned demons to conquer the world.",
      "Villagers who lived in peace were attacked by bandits.",
      "Bartender drank too much and started a bar fight.",
      "Blacksmith forged a sword that could cut through anything.",
      "Priest who healed the sick was accused of witchcraft.",
      "Noble king who ruled the land with justice and mercy was betrayed by his own son.",
      "Beautiful queen who was loved by all turned out to be secretly a vampire.",
      "Adventurers who explored the ruins found a treasure that cursed them.",
      "Farmers who worked the land were attacked by giant insects.",
      "Merchants who traveled the world found a city made of gold.",
      "Sailors who crossed the sea were attacked by a giant kraken.",
      "Miners who dug deep underground found a dragon's lair.",
      "Scholars who studied ancient texts found a forbidden spell.",
      "Artisans who crafted magical items were attacked by a rival guild.",
      "Bards who sang songs of heroes were accused of spreading lies.",
      "Alchemists who brewed potions created a deadly poison by mistake.",
      "Hunters who tracked a beast found a monster that ate them instead.",
    ];

    const index =
      parseInt(message.commit.substring(message.commit.length - 5), 16) %
      stories.length;

    return stories[index];
  }
}

export default StoryTeller;
