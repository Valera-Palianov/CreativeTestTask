import './modal.css'

class Modal {
	constructor(modal) {
		this.modal = modal
		this.modalId = this.modal.id
		this.modalWindow = this.modal.querySelector('.modal__window')
		this.modalCloseButton = this.modal.querySelector('.modal__close')
		this.modalTriggers = document.querySelectorAll('*[data-target="'+this.modalId+'"]')

		this.modalIsHidden = true

		this.onCloseClickHandler = this.onCloseClickHandler.bind(this)
		this.onTriggerClickHandler = this.onTriggerClickHandler.bind(this)
		this.onOutsideClickHandler = this.onOutsideClickHandler.bind(this)
		this.init()
	}

	init() {
		this.modalCloseButton.onclick = this.onCloseClickHandler
		this.modalTriggers.forEach((trigger) => trigger.onclick = this.onTriggerClickHandler)
	}

	hideModal() {
		this.modal.classList.add("modal_hidden")
		this.modalIsHidden = true
		document.removeEventListener('click', this.onOutsideClickHandler)
	}

	showModal() {
		this.modal.classList.remove("modal_hidden")
		this.modalIsHidden = false
		document.addEventListener('click', this.onOutsideClickHandler)
	}

	onCloseClickHandler() {
		if(!this.modalIsHidden) {
			this.hideModal()
		}
	}

	onTriggerClickHandler(event) {
		event.stopPropagation()
		if(this.modalIsHidden) {
			this.showModal()	
		}
	}

	onOutsideClickHandler(e) {
		const { target } = e
		const itsModal = target === this.modalWindow || this.modalWindow.contains(target);
		if (!itsModal) {
			if(!this.modalIsHidden) {
				this.hideModal()
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const modals = document.querySelectorAll('.modal')
	modals.forEach((modal) => new Modal(modal))
})