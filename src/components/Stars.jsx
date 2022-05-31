import React, {useState, useEffect, useRef} from 'react'
import Helpers from '../Helpers'
import {gsap} from "gsap";
import '../styles/Stars.css'

export default function Stars(props) {
  const [starCoordinates, _setStarCoordinates] = useState(
    props.starsData.map((starData, i) => {
      return (
        window.offsetWidth * Math.random()
      )
    })
  )
  const setStarCoordinates = (data) => {
    starCoordinatesRef.current = data
    _setStarCoordinates(data)
  }
  const starCoordinatesRef = useRef(starCoordinates)
  const starContainerRef = useRef()
  useEffect(() => {
    if (starContainerRef.current) {
      console.log('animating stars')
      const stars = document.getElementsByClassName('star')
      if (stars.length) {
        console.log('found stars', stars)
        Array.prototype.forEach.call(stars, (star, i) => {
          const starTime = Helpers.randomFloatFromInterval(1, 8)
          var tl = gsap.timeline();
          tl.set(star, { // set to random location
            y: props.starsData[i].co[1] * starContainerRef.current.offsetHeight,
          })
          tl.to(star, { // animate to bottom
            y: starContainerRef.current.offsetHeight,
            ease: 'none',
            duration: starTime,
          })
          tl.eventCallback("onComplete", () => {
            console.log('timeline callback')
            const tl2 = gsap.timeline({repeat: -1});
            const tween = gsap.fromTo(
              star,
              {y: 0},
              {
                y: starContainerRef.current.offsetHeight,
                duration: starTime,
                ease: 'none',
              },
            )
            tl2.add(tween);
          })
        })
      }
    }
  }, [starContainerRef])
  return (
    <div className='star-container' ref={starContainerRef}>
      {
        props.starsData.map((starData, i) => {
          return (
            <div
              style={{
                left: starData.co[0] * window.innerWidth,
                // top: starData.co[1] * (window.innerHeight - 96),
                // top: 0,
                height: starData.size,
                width: starData.size,
                // transform: `translate(${100 * Math.random()}%, ${100 * Math.random()}%)`,
              }}
              className='star'
              key={`star-${i}`}
              id={`star-${i}`}
            />
          )
        })
      }
    </div>
  )
}
