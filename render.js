function polar_to_cart(mag, angle) {
	return [
		Math.cos(angle) * mag + origin.x,
		Math.sin(angle) * mag + origin.y
	]
}

const images_cache = {}

const Renderer = {
	init(canvas) {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')

		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight

		this.ctx.font = "32px Arial"
		this.ctx.textBaseline = 'middle'

		origin.x = canvas.width/2
		origin.y = canvas.height/2

		console.log('im ok')
	},

	clear_screen() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	},

	begin_UI() {
		this.ctx.font = `24px Arial`
		this.ctx.textAlign = 'start'
	},

	draw_UI(text, x, y, tint) {
		this.ctx.fillStyle = `hsl(${tint}, 50%, 60%)`
		this.ctx.fillText(text, x, y)
	},

	draw_tree_root(name, tint, anim_radius) {
		this.ctx.fillStyle = `hsl(${tint}, 50%, 60%)`
		this.ctx.beginPath()
		this.ctx.arc(origin.x, origin.y, Math.min(100, anim_radius), 0, TAU)
		this.ctx.fill()

		const text_size = name.length <= 12 ? 24 : Math.floor(240/name.length)
		this.ctx.font = `${(anim_radius/200)*text_size}px Arial`
		this.ctx.textAlign = 'center'
		this.ctx.fillStyle = `#e0e0e0`
		this.ctx.fillText(name, origin.x, origin.y)
	},

	draw_section(arc_start, arc_size, inner_radius, outer_radius, tint, opacity) {
		this.ctx.fillStyle = `hsla(${tint}, 50%, 60%, ${opacity*100}%)`
		
		const start_angle = arc_start - (Math.PI/2)
		const end_angle = start_angle + arc_size
		this.ctx.beginPath()
		this.ctx.arc(origin.x, origin.y, inner_radius, end_angle, start_angle, true )
		this.ctx.arc(origin.x, origin.y, outer_radius, start_angle, end_angle, false)
		this.ctx.fill()

		// draw_section(arc_start, arc_size, iradius, oradius)
	},

	draw_sections(sections, inner_radius, outer_radius, opacity) {
		for (const {arc_start, arc_size, hover, tint} of sections) {
			this.draw_section(
				arc_start, arc_size,
				inner_radius + 5 - (hover ? 3 : 0),
				outer_radius + (hover ? 3 : 0),
				tint, hover ? 1 : opacity)
		}
	},

	draw_species(species, opacity) {
		for (const {point, tint, big} of species) {
			this.ctx.fillStyle = `hsla(${tint}, 50%, 60%, ${opacity*100}%)`

			this.ctx.beginPath()
			this.ctx.arc(point[0], point[1], big ? 20 : 5, 0, 2*Math.PI)
			this.ctx.fill()
		}
	},

	draw_texts(texts, opacity) {
		this.ctx.font = `${8+24*opacity}px Arial`
		this.ctx.fillStyle = `rgb(224, 224, 224)`
		this.ctx.strokeStyle = `rgb(224, 224, 224)`

		for (const {coord, name, picture, arc_size, mag, direction} of texts) {
			const align = coord[0] < origin.x ? 'end' : (coord[0] - origin.x) < 5 ? 'center' : 'start'

			if (align == 'center') coord[1] += 10

			if (arc_size < Math.PI/8) {

				const dist_x = coord[0] - origin.x
				const dist_y = coord[1] - origin.y

				

				// coord[0] = origin.x + Math.sign(dist_x) * mag
				// coord[0] = Math.abs(dist) < 100 ? origin.x + Math.sign(dist) * mag / 2 : coord[0]
				// coord[1] = Math.abs(dist) < 100 ? coord[1] : coord[1]

				if (Math.abs(dist_x) < mag/2) {
				
					this.ctx.beginPath()
					this.ctx.moveTo(coord[0], coord[1])

					const ncoord = polar_to_cart(mag+Math.abs(Math.sin(direction)**10)*50, direction)

					coord[0] = ncoord[0]
					coord[1] = ncoord[1]

					this.ctx.lineTo(coord[0], coord[1])

					// coord[0] = origin.x + Math.sign(dist_x) * mag/2
					coord[0] = origin.x + dist_x * 2

					this.ctx.lineTo(coord[0] - Math.sign(dist_x) * 10, coord[1])

					this.ctx.stroke()
				}

				
			}

			this.ctx.textAlign = align
			this.ctx.fillText(name, coord[0], coord[1])

			if (picture && picture in images_cache) {
				if (images_cache[picture] !== null) {
					const img = images_cache[picture]
					const k = 30/img.height

					if (align == 'center') {
						const offset = -k*img.width/2

						this.ctx.drawImage(img, coord[0] + offset, coord[1] + 24, k*img.width, k*img.height)
					} else if (align == 'start') {
						const offset = this.ctx.measureText(name).width + 5

						this.ctx.drawImage(img, coord[0] + offset, coord[1] - 15, k*img.width, k*img.height)
					} else if (align == 'end') {
						const offset = this.ctx.measureText(name).width + k*img.width + 5

						this.ctx.drawImage(img, coord[0] - offset, coord[1] - 15, k*img.width, k*img.height)
					}

				}
			} else if (picture) {

				try {
					let img = new Image();
					img.onload = () => {
						images_cache[picture] = img
					}

					img.onerror = (e) => {
						images_cache[picture] = null
					}

					img.src = `icons/${picture}.svg`
					images_cache[picture] = null
				} catch {

					images_cache[picture] = null
				}
			}
		}
	},

	resize(w, h) {
		this.canvas.width = w
		this.canvas.height = h
		origin.x = this.canvas.width/2
		origin.y = this.canvas.height/2
	},

	text_size(text) {
		return this.ctx.measureText(text)
	},
}