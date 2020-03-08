import './smart-table.css'

class SmartTable {
	constructor(smartTable) {
		this.smartTable = smartTable
		this.smartTableBody = this.smartTable.querySelector('tbody')
		this.smartTableHeadings = this.smartTable.querySelectorAll('.smart-table__heading')
		this.smartTableRows = this.smartTable.querySelectorAll('.smart-table__row')

		this.onColumnClickHandler = this.onColumnClickHandler.bind(this)
		this.onColumnMouseOverHandler = this.onColumnMouseOverHandler.bind(this)
		this.onTableMouseOutHandler = this.onTableMouseOutHandler.bind(this)
		this.onSearchInputChangeHandler = this.onSearchInputChangeHandler.bind(this)

		this.columns = []
		this.rows = []

		this.activeColumn = -1
		this.hoveredColumn = -1

		this.parseTable()

		this.smartTable.onmouseleave = () => {
			this.onTableMouseOutHandler()
		}
	}

	onColumnClickHandler(column) {
		if(!column.active) {
			this.highlightColumn(column)
		}
		this.changeSort(column)
	}

	onColumnMouseOverHandler(column) {
		if(!column.hover) {
			this.highlightColumn(column, 'mouseover')
		}
	}

	onTableMouseOutHandler() {
		if(this.hoveredColumn != -1) {
			this.highlightColumn(this.columns[this.hoveredColumn], 'mouseout')
		}
	}

	onSearchInputChangeHandler(column) {

		this.search(column)
		
	}

	search(column) {

		const {id, type, cellsNodes, searchInputNode} = column
		const value = searchInputNode.value
		const array = this.rows

		const relevationMatrix = []

		array.forEach((row, i) => {

			row.cells.forEach((cell, j) => {

				if(cell.columnId == id) {

					if(value == '') {
						cell.relevant = true
					} else {
						switch(type) {
							case 'int':
								if(cell.value != value) {
									cell.relevant = false
								} else {
									cell.relevant = true
								}
								break
							case 'date':
								if(cell.value.getTime() != new Date(value.split('-')).getTime()) {
									cell.relevant = false
								} else {
									cell.relevant = true
								}
								break
							case 'string':
								if(cell.value.indexOf(value) == -1) {
									cell.relevant = false
								} else {
									cell.relevant = true
								}
								break
						}
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
				this.rows[i].node.classList.add('smart-table__row_hidden')
			} else {
				this.rows[i].node.classList.remove('smart-table__row_hidden')
			}
		})
	}

	highlightColumn(column, mode = 'click') {
		if(mode == 'click') {
			if(this.activeColumn != -1) {

				const unselectingColumn = this.columns[this.activeColumn]
				unselectingColumn.active = false
				unselectingColumn.sort = 'default'
				unselectingColumn.node.classList.remove('smart-table__heading_active')
				unselectingColumn.node.classList.remove('smart-table__heading_asc')
				unselectingColumn.node.classList.remove('smart-table__heading_desc')
				unselectingColumn.cellsNodes.forEach((cellNode) => {
					cellNode.classList.remove('smart-table__cell_active')
				})

			}

			this.activeColumn = column.id

			column.active = true
			column.node.classList.add('smart-table__heading_active')
			column.cellsNodes.forEach((cellNode) => {
				cellNode.classList.add('smart-table__cell_active')
			})
		} else if (mode == 'mouseover') {
			if(this.hoveredColumn != -1) {

				const unhoveredColumn = this.columns[this.hoveredColumn]
				unhoveredColumn.hover = false
				unhoveredColumn.node.classList.remove('smart-table__heading_hover')
				unhoveredColumn.cellsNodes.forEach((cellNode) => {
					cellNode.classList.remove('smart-table__cell_hover')
				})

			}

			this.hoveredColumn = column.id

			column.hover = true
			column.node.classList.add('smart-table__heading_hover')
			column.cellsNodes.forEach((cellNode) => {
				cellNode.classList.add('smart-table__cell_hover')
			})
		} else if (mode == 'mouseout') {
			this.hoveredColumn = -1
			column.hover = false
			column.node.classList.remove('smart-table__heading_hover')
			column.cellsNodes.forEach((cellNode) => {
				cellNode.classList.remove('smart-table__cell_hover')
			})
		}
		
	}

	changeSort(column) {
		const { id, type, sort, node } = column

		let newSort

		switch(sort) {
			case 'default':
				newSort = 'asc'
				node.classList.add('smart-table__heading_asc')
				break
			case 'asc':
				newSort = 'desc'
				node.classList.remove('smart-table__heading_asc')
				node.classList.add('smart-table__heading_desc')
				break
			case 'desc':
				newSort = 'default'
				node.classList.remove('smart-table__heading_desc')
				break
		}

		column.sort = newSort

		this.sort(newSort, column)
	}

	sort(newSort, column) {

		const {sort, type, id} = column
		const array = this.rows
		

		if(sort != 'default') {
			switch(type) {
				case 'int':
					array.sort((a, b) => a.cells[id].value - b.cells[id].value)
					break
				case 'date':
					array.sort((a, b) => a.cells[id].value.getTime() - b.cells[id].value.getTime())
					break
				case 'string':
					array.sort((a, b) => a.cells[id].value.localeCompare(b.cells[id].value))
					break
			}

			if(sort == 'desc') {
				array.reverse()
			}
		} else {
			array.sort((a, b) => a.defaultPosition - b.defaultPosition)
		}

		this.tableShake()
	}

	tableShake() {
		this.rows.forEach((row) => {
			this.smartTableBody.appendChild(row.node)
		})
	}

	parseTable() {
		this.parseColumns()
		this.parseRows()
	}

	parseColumns() {
		const columns = []

		this.smartTableHeadings.forEach((column, i) => {
			const result = {}

			result.id = i
			result.node = column
			result.name = column.getAttribute('data-name')
			result.type = column.getAttribute('data-type')
			result.sort = 'default'
			result.active = false
			result.hover = false
			result.cellsNodes = []

			column.onclick = () => {
				this.onColumnClickHandler(result)
			}

			column.onmouseover = () => {
				this.onColumnMouseOverHandler(result)
			}

			if(result.name != '') {
				result.searchInputNode = this.smartTable.querySelector('.smart-table__search[name="'+result.name+'"]')
				result.searchInputNode.onchange = () => {
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
			result.node = row
			result.cells = this.parseCells(row)

			rows.push(result)
		})

		this.rows = rows
	}

	parseCells(row) {
		const cells = []

		row.querySelectorAll('.smart-table__cell').forEach((cell, j) => {
			const result = {}
			
			this.columns[j].cellsNodes.push(cell)

			result.node = cell
			result.relevant = true
			result.columnId = j
			result.type = this.columns[j].type
			result.value = this.formatValues(cell, result.type)

			cell.onclick = () => {
				this.onColumnClickHandler(this.columns[j])
			}

			cell.onmouseover = () => {
				this.onColumnMouseOverHandler(this.columns[j])
			}

			cells.push(result)
		})

		return cells
	}

	formatValues(node, type){

		const months = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'октября',
			'ноября',
			'декабря'
		]

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
					month = months.indexOf(value[1].toLowerCase())
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

}

document.addEventListener('DOMContentLoaded', () => {
	const smartTables = document.querySelectorAll('.smart-table')
	smartTables.forEach((smartTable) => new SmartTable(smartTable))
})