import React, {
  Suspense,
  lazy,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'
import { useItemList } from 'use-item-list'

const SelectContext = createContext(null)

export function Select({ children, value, onChange }) {
  const buttonRef = useRef()
  const listRef = useRef()
  const [isOpen, setIsOpen] = useState(false)

  function open() {
    setIsOpen(true)
    setTimeout(() => {
      listRef.current.focus()
    }, 0)
  }

  function close() {
    setIsOpen(false)
    buttonRef.current.focus()
  }

  const itemList = useItemList({
    selected: value,
    onSelect: (item) => {
      onChange(item)
      close()
    },
  })

  const {selectedItem, useHighlightedItemId} = itemList
  const itemId = useHighlightedItemId()

  return (
    <SelectContext.Provider value={itemList}>
      <button
        type="button"
        aria-haspopup="listbox"
        ref={buttonRef}
        aria-expanded={isOpen}
				aria-controls={itemList.listId}
        onClick={isOpen ? close : open}
      >
        {selectedItem.text || 'Select fruit'} ▼
      </button>
      <ul
        ref={listRef}
        id={itemList.listId}
        tabIndex={0}
        role="listbox"
        aria-activedescendant={itemId}
        style={{
          margin: '2px 0 0 0',
          padding: '5px 0',
          display: !isOpen && 'none',
          border: '1px solid grey',
          borderRadius: 5,
          outlineOffset: 3,
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            itemList.moveHighlightedItem(-1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            itemList.moveHighlightedItem(1)
          }
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            itemList.selectHighlightedItem()
          }
          itemList.highlightItemByString(event)
        }}
      >
        {children}
      </ul>
    </SelectContext.Provider>
  )
}

export function Option({ children, text, value, disabled }) {
  const { useItem } = useContext(SelectContext)
  const ref = useRef()
  const { id, index, highlight, select, selected, useHighlighted } = useItem({
    ref,
    text: text || children,
    value,
    disabled,
  })
  const highlighted = useHighlighted()
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onMouseEnter={highlight}
      onClick={select}
      style={{
        display: 'flex',
        padding: 8,
        backgroundColor: highlighted ? 'yellow' : 'white',
        fontWeight: selected ? 600 : 400,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {index} {children} {selected && '✅'}
    </li>
  )
}

const LazyOption = lazy(() => import('../components/LazyOption'))
const assortedFruits = ['Apple', 'Orange', 'Pear', 'Kiwi', 'Banana', 'Mango']
const staticObjectValue = { foo: 'bar' }

export function Demo() {
  const [fruits, setFruits] = useState(assortedFruits.slice(1, 4))
  const [selectedFruit, setSelectedFruit] = useState(assortedFruits[3])
  return (
    <div>
      <button onClick={() => setFruits(assortedFruits)}>Add more fruits</button>
      <br />
      <Select
        value={selectedFruit}
        onChange={(item) => setSelectedFruit(item.value)}
      >
        {fruits.map((fruit) => (
          <Option
            key={fruit}
            value={fruit}
            disabled={['Pear', 'Banana'].includes(fruit)}
          >
            {fruit}
          </Option>
        ))}
        <Option value={staticObjectValue} text="Foo/Bar">
          Foo/Bar
        </Option>
        {typeof window === 'undefined' ? (
          'Fetching Suspense option...'
        ) : (
          <Suspense fallback="Fetching Suspense option...">
            <LazyOption />
          </Suspense>
        )}
        <Option value="a">A</Option>
        <Option value="b">B</Option>
        <Option value="c">C</Option>
      </Select>
    </div>
  )
}
