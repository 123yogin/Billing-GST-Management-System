function BillItemRow({ item, index, onUpdate, onDelete }) {
  const handleChange = (field, value) => {
    const updatedItem = { ...item, [field]: value }
    onUpdate(index, updatedItem)
  }

  return (
    <tr>
      <td>
        <input
          type="text"
          className="form-control form-control-sm"
          value={item.item || ''}
          onChange={(e) => handleChange('item', e.target.value)}
          placeholder="Item name"
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

