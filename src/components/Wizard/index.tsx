import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import './Wizard.css'

const Wizard = () => {
  const [port, setPort] = useState('80')
  const [hostname, setHostname] = useState('hex2048szb9jquj-hex15.functions.fnc.fr-par.scw.cloud')
  const [radius, setRadius] = useState('2')
  const [, setSearchParams] = useSearchParams()

  const onPortInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setPort(value)
  }
  const onHostnameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setHostname(value)
  }
  const onRadiusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setRadius(value)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchParams({ radius, port, hostname })
  }

  return (
    <form onSubmit={onSubmit} className="wizard">
      <fieldset className="wizard__fieldset">
        <label className="wizard__label" htmlFor="port">
          Port
        </label>
        <input
          className="wizard__input"
          value={port}
          type="text"
          id="port"
          name="port"
          onChange={onPortInputChange}
        />
      </fieldset>
      <fieldset className="wizard__fieldset">
        <label className="wizard__label" htmlFor="hostname">
          Hostname
        </label>
        <input
          className="wizard__input"
          value={hostname}
          type="text"
          id="hostname"
          name="hostname"
          onChange={onHostnameInputChange}
        />
      </fieldset>
      <fieldset className="wizard__fieldset">
        <label className="wizard__label" htmlFor="radius">
          Radius {radius}
        </label>
        <input
          className="wizard__input"
          min={2}
          max={6}
          value={radius}
          type="range"
          id="radius"
          name="radius"
          onChange={onRadiusInputChange}
        />
      </fieldset>
      <div className="wizard__button-container">
        <button className="wizard__button">Start</button>
      </div>
    </form>
  )
}

export default Wizard
