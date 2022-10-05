const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
const objects = []

const mouse = {move: {x: 0, y: 0}}

const randBetween = (min, max) => {
    return Math.random() * (max - min) + min
}

const mapValue = (n, min1, max1, min2, max2) => {
    const range1 = max1 - min1
    const range2 = max2 - min2
    const rangeRatio = range2 / range1
    const nPlaceInRange1 = n - min1
    const nRatio = nPlaceInRange1 / range1
    const nPlaceInRange2 = nRatio * range2
    return min2 + nPlaceInRange2
}
const range = (n, min, max) => Math.min(Math.max(n, min), max)

const random3DPosition = () => {
    return {
        x: randBetween(-canvas.width / 2, canvas.width / 2),
        y: randBetween(-canvas.height / 2, canvas.height / 2),
        z: randBetween(0, canvas.height)
    }
}

const rotate3DX = (pos, x) => {
    const newX = pos.x * Math.cos(x) - pos.z * Math.sin(x)// + canvas.height / 180
    const newZ = pos.x * Math.sin(x) + pos.z * Math.cos(x)// - canvas.height / 180
    return {x: newX, y: pos.y, z: newZ}
}

const rotate3DY = (pos, y) => {
    const newY = pos.y * Math.cos(y) - pos.z * Math.sin(y)// + canvas.height / 180
    const newZ = pos.y * Math.sin(y) + pos.z * Math.cos(y)// - canvas.height / 180
    return {x: pos.x, y: newY, z: newZ}
}

const rotate3D = (pos, x, y) => {
    pos = rotate3DX(pos, x)
    return rotate3DY(pos, y)
}

const display3DPosition = (pos, size) => {
    const x = mapValue(pos.x, 0, canvas.width, pos.z, canvas.height - pos.z )
    const y = mapValue(pos.y, 0, canvas.height, pos.z, canvas.height -  pos.z )
    size = pos.z === 0 ? size : size / (mapValue(pos.z, 0, canvas.height / 3, 1, 1.2)  ** 2)
    const bright = mapValue(pos.z, 0, canvas.height / 3, 55, 45)
    const sat = mapValue(pos.z, 0, canvas.height / 3, 70, 30)
    const lineWidth = mapValue(pos.z, 0, canvas.height / 3, 2, 0.3)
    return {pos, size, bright, sat, lineWidth}
}

const Particle = (pos) => {
    const particle = {}

    particle.pos = pos
    particle.size = randBetween(0.5, 7)
    particle.color = randBetween(0, 360)
    
    particle.draw = () => {
        const {pos, size, bright, sat, lineWidth} = display3DPosition(particle.pos, particle.size)
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = `hsl(${particle.color}, ${sat}%, ${bright}%)`
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(pos.x + canvas.width / 2, pos.y + canvas.height / 2, size, 0, 2*Math.PI)
        ctx.stroke()
        ctx.fill()
    }

    particle.update = (deltaSpeed) => {
       particle.pos = rotate3D(particle.pos, mouse.move.x / 500 , mouse.move.y / 500)
       objects.sort((a, b) => b.pos.z - a.pos.z)
    }

    return particle
}

const createParticle = qty => {
    if(qty > 1) createParticle(--qty)
    objects.push(Particle(random3DPosition()))
}

createParticle(100)

const animate = () => {
  requestAnimationFrame(animate)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  objects.forEach(object => object.update())
  objects.forEach(object => object.draw())
  mouse.move.x /= 1.0005
  mouse.move.y /= 1.0005
}

animate()

addEventListener('mousemove', e => {
  mouse.move.x = range(e.movementX, -10, 10)
  mouse.move.y = range(e.movementY, -10, 10)
})

const touch = {
  now: { x: 0, y: 0 },
  prev: { x: 0, y: 0 },
}


addEventListener('touchstart', e => {
  e.preventDefault()
  touch.now.x = e.changedTouches[0].pageX
  touch.now.y = e.changedTouches[0].pageY
  touch.prev = { x: 0, y: 0 }
})
addEventListener('touchmove', e => {
  e.preventDefault()
  divX.innerText = e.changedTouches[0].pageX
  divY.innerText = e.changedTouches[0].pageY
  touch.prev = { ...touch.now }
  touch.now.x = e.changedTouches[0].pageX
  touch.now.y = e.changedTouches[0].pageY
  mouse.move.x = range(touch.now.x - touch.prev.x, -10, 10)
  mouse.move.y = range(touch.now.y - touch.prev.y, -10, 10)
})
addEventListener('touchend', e => {
  e.preventDefault()
  mouse.move = { x: 0, y: 0 }
})