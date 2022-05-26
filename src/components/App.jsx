/* Dependencies */
import {useState, useEffect, useRef} from 'react'
import {connect} from 'react-redux'
import {gsap} from "gsap";

/* Components */
import Player from './Player'

/* Actions */
import {storePayload} from '../actions/storePayload'

/* Styles */
import '../styles/App.css'

const defaultGame = {
  /* current level determines speed */
  currentLevel: 1,
  /* nextLevel is how many right answers player needs for next level */
  nextLevel: 3,
  /* Every level is faster by a factor of speedScaling */
  speedScaling: 0.3,
  /* player must beat x * levelScaling more levels to get to the next level */
  levelScaling: 2,
  /* Number of milliseconds it takes for wall to animate height of screen */
  wallSpeed: 5000,
}

function App(props) {
  const playerRef = useRef()
  const [playerStats, _setPlayerStats] = useState({
    right: 0,
    wrong: 0,
  })
  const [playerStyle, setPlayerStyle] = useState({
    height: 50,
    width: 50,
    color: 'yellow',
  })
  const [playerPhysics, _setPlayerPhysics] = useState({
    x: 0,
    y: 0,
    left: false,
    right: false,
  })
  const [mathProblem, _setMathProblem] = useState({
    problemString: '0 + 0 = ?',
    answer: 0,
    choices: [0, 0, 0, 0],
  })
  const [playerLane, _setPlayerLane] = useState(0)
  const [wallSpeed, _setWallSpeed] = useState(defaultGame.wallSpeed)
  const [nextLevel, _setNextLevel] = useState(defaultGame.nextLevel)
  const [currentLevel, _setCurrentLevel] = useState(defaultGame.currentLevel)
  
  const currentLevelRef = useRef(currentLevel)
  const nextLevelRef = useRef(nextLevel)
  const playerPhysicsRef = useRef(playerPhysics)
  const gameplayContainerRef = useRef()
  const mathProblemRef = useRef(mathProblem)
  const playerStatsRef = useRef(playerStats)
  const wallSpeedRef = useRef(wallSpeed)
  const playerLaneRef = useRef(0)
  const wallRef = useRef()
  const gameOverModalRef = useRef()
  let tl /* gsap timeline */
  const tlRef = useRef()

  useEffect(() => {
    if (!tl) { /* To only trigger once */
      startGame()
    }
  }, [])

  useEffect(() => {
    if (playerStatsRef.current.right === nextLevelRef.current) {
      tlRef.current.timeScale(1 + (currentLevelRef.current * defaultGame.speedScaling))
      setCurrentLevel(currentLevelRef.current + 1)
      setNextLevel(nextLevel * defaultGame.levelScaling)
    }
  }, [playerStats])

  function startGame() {
    /* combine these to a player progress obj */
    setPlayerStats({
      right: 0,
      wrong: 0,
    })
    setCurrentLevel(defaultGame.currentLevel)
    setNextLevel(defaultGame.nextLevel)

    document.addEventListener('keypress', onKeyPress)
    document.addEventListener('keyup', onKeyUp)

    tl = gsap.timeline({repeat: -1});
    tl.timeScale(1 + ((currentLevelRef.current - 1) * defaultGame.speedScaling))

    /* part2Time is the time it takes the wall to go from top of player
       to bottom of gameplay container

       part1Time is the time it takes the wall to go from the top of
       gameplay container to top of player
    */

    const part2Time =
      (playerStyle.height + 96) /
      (gameplayContainerRef.current.offsetHeight / wallSpeedRef.current)
    const part1Time = wallSpeedRef.current - part2Time
  
    /* Return to top after game over */
    tl.to(
      wallRef.current,
      {
        duration: 0,
        y: 96,
      }
    )
    /* Move to top of player */
    tl.to(
      wallRef.current,
      {
        duration: part1Time / 1000,
        y: `${gameplayContainerRef.current.offsetHeight - playerStyle.height}px`,
        ease: 'none',
        onComplete: () => {
          const isPlayerCorrect = isRightAnswer()
          if (isPlayerCorrect) {
            setPlayerStats({
              ...playerStatsRef.current,
              right: playerStatsRef.current.right + 1
            })
            gsap.to(document.getElementById(`door-${playerLaneRef.current}`), {borderColor: 'black', duration: 0.3})
          } else {
            setPlayerStats({
              ...playerStatsRef.current,
              wrong: playerStatsRef.current.wrong + 1
            })
            tl.pause()
            document.removeEventListener('keypress', onKeyPress)
            document.removeEventListener('keyup', onKeyUp)
            gsap.to(gameOverModalRef.current, {y: gameplayContainerRef.current.offsetHeight / 2 - 56, ease: "elastic", duration: 1.5})
          }
        }
      },
    )
    /* Move to bottom of gameplay container */
    tl.to(
      wallRef.current,
      {
        duration: part2Time / 1000,
        y: `${gameplayContainerRef.current.offsetHeight + 96}px`,
        ease: 'none',
        onComplete: () => {
          createMathProblem()
          gsap.to(document.getElementById(`door-${playerLaneRef.current}`), {borderColor: 'white', duration: 0.1})
        }
      }
    )
    tlRef.current = tl
  }

  useEffect(() => {
    movePlayer()
  }, [playerPhysics])

  function movePlayer() {
    const isNotAtRightLimit =
      playerPhysicsRef.current.x < gameplayContainerRef.current.offsetWidth - playerStyle.width
    const isNotAtLeftLimit = playerPhysicsRef.current.x > 0
    if (playerPhysics.right && isNotAtRightLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x + 1
      })
    } else if (playerPhysics.left && isNotAtLeftLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x - 1
      })
    }
  }

  /* handle state references */

  /*-----------------------------------*/
  const setPlayerPhysics = (data) => {
    playerPhysicsRef.current = data
    _setPlayerPhysics(data)
  }

  const setMathProblem = (data) => {
    mathProblemRef.current = data
    _setMathProblem(data)
  }

  const setPlayerStats = (data) => {
    playerStatsRef.current = data
    _setPlayerStats(data)
  }

  const setPlayerLane = (data) => {
    playerLaneRef.current = data
    _setPlayerLane(data)
  }

  const setWallSpeed = (data) => {
    wallSpeedRef.current = data
    _setWallSpeed(data)
  }

  const setCurrentLevel = (data) => {
    currentLevelRef.current = data
    _setCurrentLevel(data)
  }

  const setNextLevel = (data) => {
    nextLevelRef.current = data
    _setNextLevel(data)
  }
  /*-----------------------------------*/

  function onKeyPress(e) {
    if (e.key === 'a') { // left
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: true,
        right: false,
      })
    } else if (e.key === 'd') { // right
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: false,
        right: true,
      })
    }
  }

  function onKeyUp(e) {
    if (e.key === 'a') { // left
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: false,
      })
    } else if (e.key === 'd') { // right
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        right: false,
      })
    }
  }

  function createMathProblem() {
    const min = 0
    const max = 9
    const operators = ['+', '-']
    const firstNum = randomIntFromInterval(min, max)
    const secondNum = randomIntFromInterval(min, max)
    let answer
    const operatorIndex = randomIntFromInterval(0, operators.length - 1)
    if (operatorIndex === 1) {
      answer = firstNum - secondNum
    } else {
      answer = firstNum + secondNum
    }
    const choices = shuffle([
      answer,
      randomIntFromInterval(min, max),
      randomIntFromInterval(min, max),
      randomIntFromInterval(min, max)
    ])
    const problemString = `${firstNum} ${operators[operatorIndex]} ${secondNum} = ?`
    setMathProblem({
      problemString,
      answer,
      choices,
    })
  }

  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function isRightAnswer() {
    const playerLane = getPlayerLane()
    /* TO DO: move this functionality or rename function */
    setPlayerLane(playerLane)
    const playerLaneElement = document.getElementById(`door-${playerLane}`)
    const playerAnswer = playerLaneElement.innerHTML
    if (playerAnswer == mathProblemRef.current.answer) {
      console.log('correct')
      return true
    } else {
      console.log('incorrect')
      return false
    }
  }

  function getPlayerLane() {
    const gameplayContainerWidth = gameplayContainerRef.current.offsetWidth
    const laneWidth = gameplayContainerWidth / 4
    if (playerPhysicsRef.current.x < laneWidth) {
      return 0
    } else if (playerPhysicsRef.current.x < laneWidth * 2) {
      return 1
    } else if (playerPhysicsRef.current.x < laneWidth * 3) {
      return 2
    } else {
      return 3
    }
  }

  function onClickPlayAgain() {
    /* exit modal */
    gsap.to(gameOverModalRef.current, {y: '-110%', duration: 0.3})
    createMathProblem()
    startGame()
  }

  return (
    <div className="App">
      {/* <div className='overlay' /> */}
      <div className="game-over-modal" ref={gameOverModalRef}>
        <p>Game Over</p>
        <button onClick={onClickPlayAgain} className='play-again-btn'>
          Play Again
        </button>
      </div>
      <nav>
        <div className='level-container'>
          <p>Level</p>
          <p className="score">{currentLevel}</p>
        </div>
        <div className="problem">
          {mathProblem.problemString}
        </div>
        <div className="score-container">
          <p>Score</p>
          <p className="score">{playerStats.right}</p>
        </div>
      </nav>
      <div className="gameplay-container" ref={gameplayContainerRef}>
        <div
          className="wall"
          ref={wallRef}
          style={{
            animationDuration: wallSpeedRef.current,
          }}
        >
          {mathProblem.choices.map((choice, i) => {
            return (
              <div key={`door-${i}`} id={`door-${i}`} className="door">
                {choice}
              </div>
            )
          })}
        </div>
        <div
          style={{
            transform: `translate(${playerPhysics.x}px, 0)`,
            width: `${playerStyle.width}px`,
            height: `${playerStyle.height}px`,
            // width: 0,
            // height: 0,
            // border: `${playerStyle.height / 2}px solid transparent`,
            // borderTop: 0,
            // borderBottom: `${playerStyle.height}px solid ${playerStyle.color}`,
          }}
          className="player"
          ref={playerRef}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  defaultGame: state.userReducer.defaultGame,
  playerStyle: state.userReducer.playerStyle,
  playerPhysics: state.userReducer.playerPhysics,
})

export default connect(
    mapStateToProps,
    {storePayload},
)(App)
