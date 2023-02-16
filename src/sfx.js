const sfx = {
  correctAns: new Audio('Correct_Ans_2_Raw.mp3'),
  playerCrash: new Audio('Crash_Raw.mp3'),
  newLvl: new Audio('New_Lvl_Raw.mp3'),
  // correctAns: new Audio({
  //   volume: 0.5,
  //   src: 'Correct_Ans_2_Raw.mp3',
  // })
}

sfx.correctAns.volume = 0.1
sfx.playerCrash.volume = 0.2
sfx.newLvl.volume = 0.3

export default sfx