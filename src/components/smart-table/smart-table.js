import './smart-table.css'

class SmartTable {
	constructor(smartTable) {
		this.smartTable = smartTable
		this.smartTableBody = this.smartTable.querySelector('tbody')

		this.onColumnHeaderClickHandler = this.onColumnHeaderClickHandler.bind(this)

		this.columns = this.parseTable()

		//this.smartTableBody.insertBefore(this.columns[0].rows[1].row, this.columns[0].rows[0].row)
	}

	parseTable() {
		const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','ноября','декабря']
		const columns = []

		//Сначала пробегаемся по заголовку. В заголовках у нас хранятся название столбца и тип данных, который в него записывают
		const headings = this.smartTable.querySelectorAll('.smart-table__heading')
		headings.forEach((heading, i) => {
			const column = {}

			column.id = i
			column.target = heading
			column.name = heading.getAttribute('data-name')
			column.type = heading.getAttribute('data-type')
			column.sort = 'default'
			column.active = false
			column.rows = []

			columns.push(column)

			heading.onclick = this.onColumnHeaderClickHandler
		})

		//Затем пробегаемся уже по рядам, за исключением первого, который заголовочный 
		//В каждом ряду пробегаемся по ячейкам. Каждую ячейку записываем к соответсвующую ей колонку, что созданы выше
		//В зависимости от типа, указанного в заголовке, значение обрабатывается как строка, как число или как дата
		//Записывается так же стандартное положение ячейки, на случай когда нам нужно будет убрать сортировку
		//Каждая из ячеек содержит ссылку на саму себя и на свой ряд, чтобы потом можно было удобно эти ряды перемещать
		const rows = this.smartTable.querySelectorAll('.smart-table__row')
		rows.forEach((row, i) => {
			const cells = row.querySelectorAll('.smart-table__cell')
			cells.forEach((cell, j) => {
				let value = cell.innerHTML
				switch(columns[j].type) {
					case 'int':
						value = parseInt(value)
						break
					case 'date':
						let day, month, year
						value = value.split(/[-\.\/\\ ]/)
						day = parseInt(value[0])
						year = parseInt(value[2])

						if(value[1].length > 2) {
							month = months.indexOf(value[1].toLowerCase())
						} else {
							month = parseInt(value[1])-1
						}
						value = new Date(year, month, day)
						break
					default:
						value = value.toString()
				}

				columns[j].rows.push({
					value: value,
					cell: cell,
					row: row,
					defaultPosition: i
				})
			})
		})

		return columns
	}

	selectColumn(number) {
		this.columns[number].active = true
		this.columns[number].target.classList.add('smart-table__heading_active')
		this.columns[number].rows.forEach((row)=> {
			row.cell.classList.add('smart-table__cell_active')
		})
	}

	unselectColumn(number) {
		this.resetSorting(number)
		this.columns[number].active = false
		this.columns[number].target.classList.remove('smart-table__heading_active')
		this.columns[number].rows.forEach((row)=> {
			row.cell.classList.remove('smart-table__cell_active')
		})
	}

	changeSorting(number) {
		const currentSort = this.columns[number].sort
		const currentTarget = this.columns[number].target
		const currentRows = this.columns[number].rows
		const currentType = this.columns[number].type
		let newSort

		const intSort = (array) => {
			array.sort((a, b) => a.value - b.value)
		}

		const stringSort = (array) => {
			array.sort((a, b) => a.value.localeCompare(b.value))
		}

		const dateSort = (array) => {

			array.sort((a, b) => a.value.getTime() - b.value.getTime())
		}

		const resetSort = (array) => {
			array.sort((a, b) => a.defaultPosition - b.defaultPosition)
		}

		const sort = (array, type, direction) => {
			if(direction != 'default') {
				if(type == 'int') {
					intSort(array)
				} else if (type == 'string') {
					stringSort(array)
				} else if (type == 'date') {
					dateSort(array)
				}

				if(direction == 'desc') {
					array.reverse()
				}
			} else {
				resetSort(array)
			}
		}

		if(currentSort == 'default') {
			newSort = 'asc'
			currentTarget.classList.add('smart-table__heading_asc')
		} else if (currentSort == 'asc') {
			newSort = 'desc'
			currentTarget.classList.remove('smart-table__heading_asc')
			currentTarget.classList.add('smart-table__heading_desc')
		} else {
			newSort = 'default'
			currentTarget.classList.remove('smart-table__heading_desc')
		}

		this.columns[number].sort = newSort
		sort(currentRows, currentType, newSort)

		currentRows.forEach((row) => {
			this.smartTableBody.appendChild(row.row)
		})
	}

	resetSorting(number){
		this.columns[number].target.classList.remove('smart-table__heading_asc')
		this.columns[number].target.classList.remove('smart-table__heading_desc')
		this.columns[number].sort = 'default'
	}

	onColumnHeaderClickHandler(e) {
		const { target } = e
		this.columns.forEach((column, i) => {
			if(column.target != target) {
				if(column.active == true) {
					this.unselectColumn(i)
				}
			} else {
				if(column.active != true) {
					this.selectColumn(i)
				}
				this.changeSorting(i)
			}
		})
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const smartTables = document.querySelectorAll('.smart-table')
	smartTables.forEach((smartTable) => new SmartTable(smartTable))
})