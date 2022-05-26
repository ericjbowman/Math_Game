import {useState, useEffect, useRef} from 'react'
import {gsap} from "gsap";
import './App.css'

function App() {
  const playerRef = useRef()
  const [playerStats, _setPlayerStats] = useState({
    right: 0,
    wrong: 0,
  })
  const [playerStyle, setPlayerStyle] = useState({
    height: 50,
    width: 50,
    color: 'red',
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
  const [wallSpeed, setWallSpeed] = useState(5000)
  const playerPhysicsRef = useRef(playerPhysics)
  const gameplayContainerRef = useRef()
  const mathProblemRef = useRef(mathProblem)
  const playerStatsRef = useRef(playerStats)
  const wallRef = useRef()
  let wallInterval
  let tl

  useEffect(() => {
    document.addEventListener('keypress', onKeyPress)
    document.addEventListener('keyup', onKeyUp)
    const part2Time = (playerStyle.height + 96) / (gameplayContainerRef.current.offsetHeight / wallSpeed)
    const part1Time = wallSpeed - part2Time
    if (!tl) {
      tl = gsap.timeline({repeat: -1});
      tl.to(
        wallRef.current,
        {
          duration: part1Time / 1000,
          y: `${gameplayContainerRef.current.offsetHeight - playerStyle.height - 96}px`,
          ease: 'none',
          onComplete: () => {
            const isPlayerCorrect = isRightAnswer()
            if (isPlayerCorrect) {
              setPlayerStats({
                ...playerStatsRef.current,
                right: playerStatsRef.current.right + 1
              })
            } else {
              setPlayerStats({
                ...playerStatsRef.current,
                wrong: playerStatsRef.current.wrong + 1
              })
              tl.pause()
            }
          }
        },
      )
      tl.to(
        wallRef.current,
        {
          duration: part2Time / 1000,
          y: `${gameplayContainerRef.current.offsetHeight}px`,
          ease: 'none',
          onComplete: () => {
            createMathProblem()
          }
        }
      )
    }
    // if (!wallInterval) {
    //   wallInterval = setInterval(() => {
    //     const isPlayerCorrect = isRightAnswer()
    //     if (isPlayerCorrect) {
    //       setPlayerStats({
    //         ...playerStatsRef.current,
    //         right: playerStatsRef.current.right + 1
    //       })
    //       createMathProblem()
    //     } else {
    //       setPlayerStats({
    //         ...playerStatsRef.current,
    //         wrong: playerStatsRef.current.wrong + 1
    //       })
    //     }
    //   }, wallSpeed)
    // }
  }, [])

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

  return (
    <div className="App">
      <nav>
        <div className="problem">
          {mathProblem.problemString}
        </div>
      </nav>
      <div className="gameplay-container" ref={gameplayContainerRef}>
        <div
          className="wall"
          ref={wallRef}
          style={{
            animationDuration: wallSpeed,
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
            height: `${playerStyle.height}px`,
            width: `${playerStyle.width}px`,
            backgroundColor: playerStyle.color,
          }}
          className="player"
          ref={playerRef}
        />
      </div>
    </div>
  )
}

export default App
