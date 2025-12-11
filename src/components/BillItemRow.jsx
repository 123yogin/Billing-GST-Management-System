import SearchableDropdown from './SearchableDropdown'

function BillItemRow({ item, index, onUpdate, onDelete, itemsList }) {
  const handleItemSelect = (val) => {
    let updatedItem = { ...item, item: val }

    // Auto-fill HSN code if item is found in the list
    if (itemsList) {
      const selectedItem = itemsList.find(i => i.name === val)
      if (selectedItem) {
        updatedItem.hsn_code = selectedItem.hsn_code || ''
      }
    }

    onUpdate(index, updatedItem)
  }

  const handleChange = (field, value) => {
    const updatedItem = { ...item, [field]: value }
    onUpdate(index, updatedItem)
  }

  return (
    <tr>
      <td>
        <SearchableDropdown
          options={itemsList || []}
          label="name"
          id={`item-name-${index}`}
          selectedVal={item.item || ''}
          handleChange={handleItemSelect}
          placeholder="Item name"
        />
      </td>
      <td>
        <input
          type="text"
          className="form-control form-control-sm"
          value={item.hsn_code || ''}
          onChange={(e) => handleChange('hsn_code', e.target.value)}
          placeholder="HSN"
        />
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.quantity_bags || ''}
          onChange={(e) => handleChange('quantity_bags', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.weight || ''}
          onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.01"
        />
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          value={item.price || ''}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.01"
        />
      </td>
      <td className="text-end">
        <strong>{(item.item_total || 0).toFixed(2)}</strong>
      </td>
      <td>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(index)}
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default BillItemRow

