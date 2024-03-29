import React, {useState, useEffect, useRef} from 'react'
import Helpers from '../Helpers'
import {gsap} from "gsap";
import '../styles/Stars.css'

export default function Stars(props) {
  const starContainerRef = useRef()
  useEffect(() => {
    console.log('use effect')
    if (starContainerRef.current) {
      const containerHeight = starContainerRef.current.offsetHeight
      const stars = document.getElementsByClassName('star')
      if (stars.length) {
        console.log('animating stars', stars.length)
        Array.prototype.forEach.call(stars, (star, i) => {
          const starTime = Helpers.randomFloatFromInterval(1, 8)
          // var tl = gsap.timeline();
          const startY = Math.floor(props.starData[i].co[1] * containerHeight)
          gsap.set(star, { // set to random location
            y: startY,
          })
          gsap.to(star, { // animate to bottom
            y: containerHeight,
            ease: 'none',
            duration: starTime,
            onComplete: () => {
              gsap.fromTo(
                star,
                {y: 0},
                {
                  y: containerHeight,
                  duration: starTime,
                  ease: 'none',
                  repeat: -1,
                },
              )
            }
          })
        })
      }
    }
  }, [starContainerRef])
  return (
    <div className='star-container' ref={starContainerRef}>
      {
        props.starData.map((star, i) => {
          return (
            <div
              style={{
                left: Math.floor(star.co[0] * window.innerWidth),
                // top: star.co[1] * (window.innerHeight - 96),
                // top: 0,
                height: star.size,
                width: star.size,
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
