import './smart-table.css'

class SmartTable {
	constructor(smartTable) {
		this.smartTable = smartTable
		this.smartTableBody = this.smartTable.querySelector('tbody')
		this.smartTableHeadings = this.smartTable.querySelectorAll('.smart-table__heading')
		this.smartTableRows = this.smartTable.querySelectorAll('.smart-table__row')

		this.onColumnClickHandler = this.onColumnClickHandler.bind(this)
		this.onSearchInputChangeHandler = this.onSearchInputChangeHandler.bind(this)

		this.months = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'ноября',
			'декабря'
		]

		this.columns = []
		this.rows = []

		this.activeColumn = -1

		this.init()
	}

	init() {
		
		this.parseColumns()
		this.parseRows()

	}

	parseColumns() {
		const columns = []

		this.smartTableHeadings.forEach((column, i) => {
			const result = {}

			result.id = i
			result.self = column
			result.name = column.getAttribute('data-name')
			result.type = column.getAttribute('data-type')
			result.sort = 'default'
			result.active = false

			column.onclick = () => {
				this.onColumnClickHandler(result)
			}

			if(result.name != '') {
				result.searchInput = this.smartTable.querySelector('.smart-table__search[name="'+result.name+'"]')
				result.searchInput.onchange = () => {
					this.onSearchInputChangeHandler(result)
				}
			}

			columns.push(result)
		})

		this.columns = columns
	}

	parseRows() {
		const rows = []

		this.smartTableRows.forEach((row, i) => {
			const result = {}

			result.defaultPosition = i
			result.self = row
			result.cells = this.parseCells(row)

			rows.push(result)
		})

		this.rows = rows
	}

	parseCells(row) {
		const cells = []

		row.querySelectorAll('.smart-table__cell').forEach((cell, j) => {
			const result = {}
			
			result.self = cell
			result.relevant = true
			result.columnId = j
			result.type = this.columns[j].type
			result.value = this.parseValues(cell, result.type)

			cells.push(result)
		})

		return cells
	}

	parseValues(node, type){

		let value = node.innerHTML

		switch(type) {
			case 'int':
				value = parseInt(value)
				break
			case 'date':

				value = value.split(/[-\.\/\\ ]/)

				let day, month, year

				day = parseInt(value[0])
				year = parseInt(value[2])
				if(value[1].length > 2) {
					month = this.months.indexOf(value[1].toLowerCase())
				} else {
					month = parseInt(value[1])-1
				}

				value = new Date(year, month, day)
				break
			default:
				value = value.toString()
		}

		return value
	}

	highlightColumn(column) {

		if(this.activeColumn != -1) {
			const unselectingColumn = this.columns[this.activeColumn]
			unselectingColumn.active = false
			unselectingColumn.self.classList.remove('smart-table__heading_active')

			this.rows.forEach((row)=> {
				row.cells.forEach((cell)=> {
					if (cell.columnId == unselectingColumn.id) {
						cell.self.classList.remove('smart-table__cell_active')
					}
				})
			})
		}

		this.activeColumn = column.id

		column.active = true
		column.self.classList.add('smart-table__heading_active')

		this.rows.forEach((row)=> {
			row.cells.forEach((cell)=> {
				if (cell.columnId == column.id) {
					cell.self.classList.add('smart-table__cell_active')
				}
			})
		})

	}

	sorting(newSort, column) {

		const direction = column.sort
		const type = column.type
		const array = this.rows
		const columnId = column.id

		if(direction != 'default') {
			switch(type) {
				case 'int':
					array.sort((a, b) => a.cells[columnId].value - b.cells[columnId].value)
					break
				case 'date':
					array.sort((a, b) => a.cells[columnId].value.getTime() - b.cells[columnId].value.getTime())
					break
				case 'string':
					array.sort((a, b) => a.cells[columnId].value.localeCompare(b.cells[columnId].value))
					break
			}

			if(direction == 'desc') {
				array.reverse()
			}
		} else {
			array.sort((a, b) => a.defaultPosition - b.defaultPosition)
		}

		this.tableShake()
	}

	tableShake() {
		this.rows.forEach((row) => {
			this.smartTableBody.appendChild(row.self)
		})
	}

	changeSorting(column) {
		const columnId = column.id
		const columnType = column.type

		const currentSort = column.sort
		let newSort

		switch(currentSort) {
			case 'default':
				newSort = 'asc'
				column.self.classList.add('smart-table__heading_asc')
				break
			case 'asc':
				newSort = 'desc'
				column.self.classList.remove('smart-table__heading_asc')
				column.self.classList.add('smart-table__heading_desc')
				break
			case 'desc':
				newSort = 'default'
				column.self.classList.remove('smart-table__heading_desc')
				break
		}

		column.sort = newSort

		this.sorting(newSort, column)
	}

	onColumnClickHandler(column) {
		if(!column.active) {
			this.highlightColumn(column)
		}
		this.changeSorting(column)
	}

	onSearchInputChangeHandler(column) {

		const columnNumber = column.id
		const inputValue = column.searchInput.value
		const type = column.type
		const array = this.rows


		const relevationMatrix = []
		array.forEach((row, i) => {
			row.cells.forEach((cell, j) => {
				if(cell.columnId == columnNumber) {
					switch(type) {
						case 'int':
							if(cell.value != inputValue && inputValue != '') {
								cell.relevant = false
							} else {
								cell.relevant = true
							}
							break
						case 'date':
							const time = new Date(inputValue.split('-')).getTime()
							if(cell.value.getTime() != time && inputValue != '') {
								cell.relevant = false
							} else {
								cell.relevant = true
							}
							break
						case 'string':
							if(cell.value.indexOf(inputValue) == -1 && inputValue != '') {
								cell.relevant = false
							} else {
								cell.relevant = true
							}
							break
					}
				}
				if(j == 0) relevationMatrix[i] = []
				relevationMatrix[i][j] = cell.relevant

			})
		})

		const relevationRows = []
		relevationMatrix.forEach((row, i) => {
			let rowIsRelevant = true
			row.forEach((value) => {
				if(!value) rowIsRelevant = false
			})
			relevationRows[i] = rowIsRelevant
		})

		relevationRows.forEach((row, i) => {
			if(!row) {
				this.rows[i].self.classList.add('smart-table__row_hidden')
			} else {
				this.rows[i].self.classList.remove('smart-table__row_hidden')
			}
		})
	}


}

document.addEventListener('DOMContentLoaded', () => {
	const smartTables = document.querySelectorAll('.smart-table')
	smartTables.forEach((smartTable) => new SmartTable(smartTable))
})