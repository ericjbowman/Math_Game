/* Dependencies */
import {useState, useEffect, useRef} from 'react'
import Helpers from '../Helpers'
import starsData from '../starsData'
import {connect} from 'react-redux'
import {gsap} from "gsap";
import sfx from '../sfx'

/* Components */
import Modal from './Modal'
import Nav from './Nav'
import Stars from './Stars'
import Player from './Player'

/* Actions */
import {storePayload} from '../actions/storePayload'

/* Styles */
import '../styles/App.css'

/* App handles:
    -player rendering
    -collision detection
    -math problem generation
    -wall rendering and animations
    -play again functionality
*/

function App(props) {
  console.log('RENDER')
  const playerRef = useRef()
  const playerPhysicsRef = useRef(props.playerPhysics)
  const gameplayContainerRef = useRef()
  const mathProblemRef = useRef(props.mathProblem)
  const playerStatsRef = useRef(props.playerStats)
  const playerLaneRef = useRef(props.playerLane)
  const wallRef = useRef()
  const gameOverModalRef = useRef()
  let tl /* gsap timeline */
  const tlRef = useRef()

  useEffect(() => {
    console.log('rerender')
    if (!tl) { /* To only trigger once */
      /* Set player stats, attach key listeners, animate wall */
      startGame()
      /* Starts continuous function that checks for player physics */
      movePlayer()
    }
  }, [])

  useEffect(() => {
    if (playerStatsRef.current.right === playerStatsRef.current.nextLevel) { // next level
      /* Play sfx after correct answer sound */
      setTimeout(() => {
        sfx.newLvl.play()
      }, [500])
      /* Speed up wall */
      tlRef.current.timeScale(1 + (playerStatsRef.current.currentLevel * props.defaultGame.speedScaling))
      /* Update currentlevel, update next level threshold */
      setPlayerStats({
        ...playerStatsRef.current,
        currentLevel: playerStatsRef.current.currentLevel + 1,
        nextLevel: playerStatsRef.current.nextLevel * props.defaultGame.levelScaling
      })
    }
  }, [props.playerStats])

  function startGame() {
    /* Reset player stats */
    setPlayerStats({
      right: 0,
      wrong: 0,
      currentLevel: props.defaultGame.currentLevel,
      nextLevel: props.defaultGame.nextLevel
    })

    /* Reattach key listeners */
    document.addEventListener('keypress', onKeyPress)
    document.addEventListener('keyup', onKeyUp)

    /* Move wall */
    tl = gsap.timeline({repeat: -1});

    /* Scale wall animation to current level */
    tl.timeScale(1 + ((playerStatsRef.current.currentLevel - 1) * props.defaultGame.speedScaling))

    /* part2Time is the time it takes the wall to go from top of player
       to bottom of gameplay container

       part1Time is the time it takes the wall to go from the top of
       gameplay container to top of player
    */

    const part2Time =
      (props.playerStyle.height + 96) /
      (gameplayContainerRef.current.offsetHeight / props.defaultGame.wallSpeed)
    const part1Time = props.defaultGame.wallSpeed - part2Time
  
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
        y: `${gameplayContainerRef.current.offsetHeight - props.playerStyle.height}px`,
        ease: 'none',
        onComplete: () => {
          const isPlayerCorrect = isRightAnswer()
          if (isPlayerCorrect) {
            /* Play correct answer noise, update score, animate wall to bottom of screen */
            sfx.correctAns.play()
            setPlayerStats({
              ...playerStatsRef.current,
              right: playerStatsRef.current.right + 1
            })
            gsap.to(document.getElementById(`door-${playerLaneRef.current}`), {borderColor: 'black', duration: 0.3})
          } else {
            /* Crash, game over, score cleared, play again option */
            stopPlayer()
            sfx.playerCrash.play()
            setPlayerStats({
              ...playerStatsRef.current,
              wrong: playerStatsRef.current.wrong + 1
            })
            tl.pause()
            document.removeEventListener('keypress', onKeyPress)
            document.removeEventListener('keyup', onKeyUp)
            gsap.to(gameOverModalRef.current, {opacity: 1, y: gameplayContainerRef.current.offsetHeight / 2 - 56, duration: 0.3})
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

  function movePlayer() {
    const isNotAtRightLimit =
      playerPhysicsRef.current.x < gameplayContainerRef.current.offsetWidth - props.playerStyle.width
    const isNotAtLeftLimit = playerPhysicsRef.current.x > 0
    if (playerPhysicsRef.current.right && isNotAtRightLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x + props.defaultGame.playerSpeed
      })
    } else if (playerPhysicsRef.current.left && isNotAtLeftLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x - props.defaultGame.playerSpeed
      })
    }
    setTimeout(() => {
      window.requestAnimationFrame(movePlayer)
    }, props.defaultGame.frameRate)
  }

  function stopPlayer() {
    setPlayerPhysics({
      ...playerPhysicsRef.current,
      left: false,
      right: false,
    })
  }

  /* handle state references
  -----------------------------------*/
  const setPlayerPhysics = (data) => {
    playerPhysicsRef.current = data
    // _setPlayerPhysics(data)
    props.storePayload({
      playerPhysics: data,
    })
  }

  const setMathProblem = (data) => {
    mathProblemRef.current = data
    props.storePayload({
      mathProblem: data,
    })
  }

  const setPlayerStats = (data) => {
    playerStatsRef.current = data
    props.storePayload({
      playerStats: data,
    })
  }

  const setPlayerLane = (data) => {
    playerLaneRef.current = data
    // _setPlayerLane(data)
    props.storePayload({
      playerLane: data,
    })
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
    const {randomIntFromInterval, shuffle} = Helpers
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

  function isRightAnswer() {
    const playerLane = getPlayerLane()
    /* TO DO: move this functionality or rename function */
    const playerLaneElement = document.getElementById(`door-${playerLane}`)
    const playerAnswer = playerLaneElement.innerHTML
    if (playerAnswer == mathProblemRef.current.answer) {
      // console.log('correct')
      return true
    } else {
      // console.log('incorrect')
      return false
    }
  }

  function getPlayerLane() {
    const gameplayContainerWidth = gameplayContainerRef.current.offsetWidth
    const laneWidth = gameplayContainerWidth / 4
    let lane
    if (playerPhysicsRef.current.x < laneWidth) {
      lane = 0
    } else if (playerPhysicsRef.current.x < laneWidth * 2) {
      lane = 1
    } else if (playerPhysicsRef.current.x < laneWidth * 3) {
      lane = 2
    } else {
      lane = 3
    }
    setPlayerLane(lane)
    return lane
  }

  function onClickPlayAgain() {
    /* exit modal */
    gsap.to(gameOverModalRef.current, {y: '-110%', opacity: 0, duration: 0.3})
    createMathProblem()
    startGame()
  }

  return (
    <div className="App">
      {/* <div className='overlay' /> */}
      <Modal
        onClickPlayAgain={onClickPlayAgain}
        gameOverModalRef={gameOverModalRef}
      />
      <Nav />
      <div className="gameplay-container" ref={gameplayContainerRef}>
        <Stars starsData={starsData}/>
        <div
          className="wall"
          ref={wallRef}
        >
          {props.mathProblem.choices.map((choice, i) => {
            return (
              <div key={`door-${i}`} id={`door-${i}`} className="door">
                {choice}
              </div>
            )
          })}
        </div>
        <Player playerRef={playerRef} />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  defaultGame: state.userReducer.defaultGame,
  playerStats: state.userReducer.playerStats,
  playerStyle: state.userReducer.playerStyle,
  playerPhysics: state.userReducer.playerPhysics,
  playerLane: state.userReducer.playerLane,
  mathProblem: state.userReducer.mathProblem,
})

export default connect(
    mapStateToProps,
    {storePayload},
)(App)
