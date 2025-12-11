import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDeal, getDealers } from '../services/api'
import SearchableDropdown from '../components/SearchableDropdown'
import '../styles/BillForm.css'

function CreateDeal() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_name: '',
    dealer_id: null,
    total_amount: '',
    interest_percentage: '',
    deal_date: new Date().toISOString().split('T')[0],
    installments: []
  })
  const [dealersList, setDealersList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [installmentCount, setInstallmentCount] = useState(0)
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [installmentPercentage, setInstallmentPercentage] = useState('')
  const [installmentInterval, setInstallmentInterval] = useState(30) // days
  const [installmentMode, setInstallmentMode] = useState('fix') // 'fix' or 'manual'
  const [manualInstallments, setManualInstallments] = useState([]) // Array of {amount, days, percentage, due_date}
  const [newInstallmentAmount, setNewInstallmentAmount] = useState('')
  const [newInstallmentPercentage, setNewInstallmentPercentage] = useState('')
  const [newInstallmentDays, setNewInstallmentDays] = useState('')
  const [newInstallmentDate, setNewInstallmentDate] = useState('')
  const [percentageError, setPercentageError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [manualPercentageErrors, setManualPercentageErrors] = useState({}) // Object to track errors per installment
  const [manualAmountErrors, setManualAmountErrors] = useState({}) // Object to track errors per installment
  const [manualPercentageInputs, setManualPercentageInputs] = useState({}) // Store raw input values for percentages
  const [focusedPercentageIndex, setFocusedPercentageIndex] = useState(null) // Track which percentage field is focused
  const [fixPercentageInputs, setFixPercentageInputs] = useState({}) // Store raw input values for fix mode percentages
  const [focusedFixPercentageIndex, setFocusedFixPercentageIndex] = useState(null) // Track which fix percentage field is focused

  useEffect(() => {
    loadDealers()
  }, [])

  // Validate when total_amount changes in fix mode
  useEffect(() => {
    if (installmentMode === 'fix' && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      
      // Validate percentage
      if (installmentPercentage) {
        const percentage = parseFloat(installmentPercentage)
        if (percentage > 100) {
          setPercentageError('Percentage cannot exceed 100%')
        } else {
          setPercentageError('')
        }
      }
      
      // Validate amount
      if (installmentAmount) {
        const amount = parseFloat(installmentAmount)
        if (amount > totalAmount) {
          setAmountError('Amount cannot exceed total amount')
        } else {
          setAmountError('')
        }
      }
    }
  }, [formData.total_amount, installmentMode])

  const loadDealers = async () => {
    try {
      const response = await getDealers()
      setDealersList(response.data)
    } catch (error) {
      console.error("Failed to load dealers", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handler for Number of Installments change
  const handleInstallmentCountChange = (value) => {
    // Allow empty string for free typing
    if (value === '') {
      setInstallmentCount(0)
      setInstallmentPercentage('')
      setInstallmentAmount('')
      setPercentageError('')
      setAmountError('')
      return
    }
    
    const count = parseInt(value) || 0
    setInstallmentCount(count)
    
    // Clear errors when count changes (will be recalculated)
    setPercentageError('')
    setAmountError('')
    
    if (count > 0 && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      // Calculate percentage: 100% / count
      const percentage = (100 / count).toFixed(2)
      setInstallmentPercentage(percentage)
      
      // Validate percentage (shouldn't exceed 100% when calculated from count)
      if (parseFloat(percentage) > 100) {
        setPercentageError('Percentage cannot exceed 100%')
      }
      
      // Calculate amount: total / count
      const amount = (totalAmount / count).toFixed(2)
      setInstallmentAmount(amount)
      
      // Validate amount (shouldn't exceed total when calculated from count)
      if (parseFloat(amount) > totalAmount) {
        setAmountError('Amount cannot exceed total amount')
      }
    } else if (count === 0) {
      setInstallmentPercentage('')
      setInstallmentAmount('')
      setPercentageError('')
      setAmountError('')
    }
  }

  // Handler for Percentage change
  const handleInstallmentPercentageChange = (value) => {
    const percentage = parseFloat(value) || 0
    setInstallmentPercentage(value)
    
    // Validate percentage
    if (percentage > 100) {
      setPercentageError('Percentage cannot exceed 100%')
    } else {
      setPercentageError('')
    }
    
    if (percentage > 0 && percentage <= 100 && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      // Calculate amount: total * percentage / 100
      const amount = (totalAmount * percentage / 100).toFixed(2)
      setInstallmentAmount(amount)
      
      // Validate calculated amount
      if (parseFloat(amount) > totalAmount) {
        setAmountError('Amount cannot exceed total amount')
      } else {
        setAmountError('')
      }
      
      // Calculate number of installments: 100 / percentage (must be whole number)
      const count = Math.floor(100 / percentage)
      if (count > 0) {
        setInstallmentCount(count)
      }
    } else if (percentage === 0) {
      setInstallmentAmount('')
      setInstallmentCount(0)
      setAmountError('')
    }
  }

  // Handler for Amount change
  const handleInstallmentAmountChange = (value) => {
    setInstallmentAmount(value)
    const amount = parseFloat(value) || 0
    
    // Validate amount
    if (formData.total_amount && amount > parseFloat(formData.total_amount)) {
      setAmountError('Amount cannot exceed total amount')
    } else {
      setAmountError('')
    }
    
    if (amount > 0 && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      // Calculate percentage: (amount / total) * 100
      const percentage = ((amount / totalAmount) * 100).toFixed(2)
      setInstallmentPercentage(percentage)
      
      // Validate calculated percentage
      if (parseFloat(percentage) > 100) {
        setPercentageError('Percentage cannot exceed 100%')
      } else {
        setPercentageError('')
      }
      
      // Calculate number of installments: total / amount (must be whole number)
      const count = Math.floor(totalAmount / amount)
      if (count > 0) {
        setInstallmentCount(count)
      }
    } else if (amount === 0) {
      setInstallmentPercentage('')
      setInstallmentCount(0)
      setPercentageError('')
    }
  }

  const generateInstallments = () => {
    if (!installmentCount || !installmentAmount || !formData.deal_date || !formData.total_amount) {
      setError('Please fill in deal date, total amount, installment count, and installment amount')
      return
    }

    const installments = []
    const startDate = new Date(formData.deal_date)
    const totalAmount = parseFloat(formData.total_amount)
    const perInstallment = parseFloat(installmentAmount)
    const totalInstallmentAmount = perInstallment * installmentCount

    if (totalInstallmentAmount > totalAmount) {
      setError('Total installment amount cannot exceed deal amount')
      return
    }

    // Use percentage from state if available, otherwise calculate it
    const percentage = installmentPercentage ? parseFloat(installmentPercentage) : (totalAmount > 0 ? (perInstallment / totalAmount) * 100 : 0)

    for (let i = 0; i < installmentCount; i++) {
      const days = (i + 1) * installmentInterval
      const dueDate = new Date(startDate)
      dueDate.setDate(dueDate.getDate() + days)

      installments.push({
        due_date: dueDate.toISOString().split('T')[0],
        amount: perInstallment,
        percentage: percentage,
        days: days
      })
    }

    setFormData({ ...formData, installments })
    setError('')
  }

  const updateFixInstallment = (index, field, value) => {
    const updated = [...formData.installments]
    const totalAmount = parseFloat(formData.total_amount) || 0
    const startDate = new Date(formData.deal_date)
    
    if (field === 'percentage') {
      // Store raw input value for free typing
      setFixPercentageInputs(prev => ({ ...prev, [index]: value }))
      
      // Only parse and update if value is not empty
      if (value === '' || value === '.') {
        updated[index] = { ...updated[index], percentage: 0 }
        setFormData(prev => ({ ...prev, installments: updated }))
        return
      }
      
      const percentage = parseFloat(value) || 0
      const amount = (percentage / 100) * totalAmount
      updated[index] = { ...updated[index], percentage: percentage, amount: amount }
    } else if (field === 'amount') {
      const amount = parseFloat(value) || 0
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      updated[index] = { ...updated[index], amount: amount, percentage: percentage }
    } else if (field === 'days') {
      const days = parseInt(value) || 0
      let dueDate
      if (days === 0) {
        dueDate = new Date() // Today's date
      } else {
        dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + days)
      }
      updated[index] = { ...updated[index], days: days, due_date: dueDate.toISOString().split('T')[0] }
    } else if (field === 'due_date') {
      const dueDate = new Date(value)
      const daysDiff = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24))
      const days = daysDiff >= 0 ? daysDiff : 0
      updated[index] = { ...updated[index], due_date: value, days: days }
    }
    
    setFormData(prev => ({ ...prev, installments: updated }))
  }

  // Handler for new manual installment percentage change
  const handleNewManualPercentageChange = (value) => {
    setNewInstallmentPercentage(value)
    const percentage = parseFloat(value) || 0
    
    // Validate percentage
    if (percentage > 100) {
      setPercentageError('Percentage cannot exceed 100%')
    } else {
      setPercentageError('')
    }
    
    if (percentage > 0 && percentage <= 100 && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      // Calculate amount: total * percentage / 100
      const amount = (totalAmount * percentage / 100).toFixed(2)
      setNewInstallmentAmount(amount)
      
      // Validate calculated amount
      if (parseFloat(amount) > totalAmount) {
        setAmountError('Amount cannot exceed total amount')
      } else {
        setAmountError('')
      }
    } else if (percentage === 0) {
      setNewInstallmentAmount('')
    }
  }

  // Handler for new manual installment amount change
  const handleNewManualAmountChange = (value) => {
    setNewInstallmentAmount(value)
    const amount = parseFloat(value) || 0
    
    // Validate amount
    if (formData.total_amount && amount > parseFloat(formData.total_amount)) {
      setAmountError('Amount cannot exceed total amount')
    } else {
      setAmountError('')
    }
    
    if (amount > 0 && formData.total_amount) {
      const totalAmount = parseFloat(formData.total_amount)
      // Calculate percentage: (amount / total) * 100
      const percentage = ((amount / totalAmount) * 100).toFixed(2)
      setNewInstallmentPercentage(percentage)
      
      // Validate calculated percentage
      if (parseFloat(percentage) > 100) {
        setPercentageError('Percentage cannot exceed 100%')
      } else {
        setPercentageError('')
      }
    } else if (amount === 0) {
      setNewInstallmentPercentage('')
    }
  }

  // Handler for new manual installment days change
  const handleNewManualDaysChange = (value) => {
    setNewInstallmentDays(value)
    const days = parseInt(value) || 0
    
    if (days >= 0 && formData.deal_date) {
      const startDate = new Date(formData.deal_date)
      let dueDate
      if (days === 0) {
        dueDate = new Date() // Today's date
      } else {
        dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + days)
      }
      setNewInstallmentDate(dueDate.toISOString().split('T')[0])
    }
  }

  // Handler for new manual installment date change
  const handleNewManualDateChange = (value) => {
    setNewInstallmentDate(value)
    if (formData.deal_date && value) {
      const startDate = new Date(formData.deal_date)
      const dueDate = new Date(value)
      const daysDiff = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24))
      const days = daysDiff >= 0 ? daysDiff : 0
      setNewInstallmentDays(days.toString())
    }
  }

  const addManualInstallment = () => {
    // If adding first installment, add empty row
    if (manualInstallments.length === 0) {
      const startDate = new Date(formData.deal_date)
      const today = new Date().toISOString().split('T')[0]
      const newInstallment = {
        amount: 0,
        percentage: 0,
        days: 0,
        due_date: today
      }
      setManualInstallments([newInstallment])
      return
    }

    // For subsequent installments, calculate remaining percentage
    const totalAmount = parseFloat(formData.total_amount) || 0
    const usedPercentage = manualInstallments.reduce((sum, inst) => sum + (parseFloat(inst.percentage) || 0), 0)
    const remainingPercentage = Math.max(0, 100 - usedPercentage)
    
    // Calculate amount from remaining percentage
    const remainingAmount = totalAmount > 0 ? (totalAmount * remainingPercentage / 100) : 0
    
    const startDate = new Date(formData.deal_date)
    const today = new Date().toISOString().split('T')[0]
    
    const newInstallment = {
      amount: remainingAmount,
      percentage: remainingPercentage,
      days: 0,
      due_date: today
    }

    // Always append at the end
    setManualInstallments([...manualInstallments, newInstallment])
  }

  const removeManualInstallment = (index) => {
    const updated = manualInstallments.filter((_, i) => i !== index)
    
    // If there are installments remaining, recalculate the last one to balance to 100%
    if (updated.length > 0) {
      const totalAmount = parseFloat(formData.total_amount) || 0
      
      // Calculate total percentage of all installments except the last one
      const installmentsExceptLast = updated.slice(0, -1)
      const usedPercentage = installmentsExceptLast.reduce((sum, inst) => sum + (parseFloat(inst.percentage) || 0), 0)
      
      // Calculate remaining percentage for the last installment
      const remainingPercentage = Math.max(0, 100 - usedPercentage)
      
      // Calculate amount from remaining percentage
      const remainingAmount = totalAmount > 0 ? (totalAmount * remainingPercentage / 100) : 0
      
      // Update the last installment
      const lastIndex = updated.length - 1
      updated[lastIndex] = {
        ...updated[lastIndex],
        percentage: remainingPercentage,
        amount: remainingAmount
      }
    }
    
    setManualInstallments(updated)
    
    // Clear errors for removed installment and reindex remaining errors
    setManualPercentageErrors(prev => {
      const newErrors = {}
      Object.keys(prev).forEach(key => {
        const keyNum = parseInt(key)
        if (keyNum < index) {
          newErrors[keyNum] = prev[key]
        } else if (keyNum > index) {
          newErrors[keyNum - 1] = prev[key]
        }
      })
      return newErrors
    })
    setManualAmountErrors(prev => {
      const newErrors = {}
      Object.keys(prev).forEach(key => {
        const keyNum = parseInt(key)
        if (keyNum < index) {
          newErrors[keyNum] = prev[key]
        } else if (keyNum > index) {
          newErrors[keyNum - 1] = prev[key]
        }
      })
      return newErrors
    })
  }

  const updateManualInstallment = (index, field, value) => {
    const updated = [...manualInstallments]
    const totalAmount = parseFloat(formData.total_amount) || 0
    const startDate = new Date(formData.deal_date)
    
    // Clear errors for this installment
    setManualPercentageErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
    setManualAmountErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
    
    if (field === 'percentage') {
      // Store raw input value for free typing
      setManualPercentageInputs(prev => ({ ...prev, [index]: value }))
      
      // Only parse and update if value is not empty
      if (value === '' || value === '.') {
        updated[index] = { ...updated[index], percentage: 0 }
        setManualInstallments(updated)
        return
      }
      
      const percentage = parseFloat(value) || 0
      
      // Validate percentage
      if (percentage > 100) {
        setManualPercentageErrors(prev => ({ ...prev, [index]: 'Percentage cannot exceed 100%' }))
      } else {
        setManualPercentageErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[index]
          return newErrors
        })
      }
      
      if (percentage > 0 && percentage <= 100 && totalAmount > 0) {
        // Calculate amount: total * percentage / 100
        const amount = (totalAmount * percentage / 100).toFixed(2)
        updated[index] = { ...updated[index], percentage: percentage, amount: parseFloat(amount) }
        
        // Validate calculated amount
        if (parseFloat(amount) > totalAmount) {
          setManualAmountErrors(prev => ({ ...prev, [index]: 'Amount cannot exceed total amount' }))
        }
      } else {
        updated[index] = { ...updated[index], percentage: percentage }
      }
    } else if (field === 'amount') {
      const amount = parseFloat(value) || 0
      
      // Validate amount
      if (amount > totalAmount) {
        setManualAmountErrors(prev => ({ ...prev, [index]: 'Amount cannot exceed total amount' }))
      }
      
      if (amount > 0 && totalAmount > 0) {
        // Calculate percentage: (amount / total) * 100
        const percentage = ((amount / totalAmount) * 100).toFixed(2)
        updated[index] = { ...updated[index], amount: amount, percentage: parseFloat(percentage) }
        
        // Validate calculated percentage
        if (parseFloat(percentage) > 100) {
          setManualPercentageErrors(prev => ({ ...prev, [index]: 'Percentage cannot exceed 100%' }))
        }
      } else {
        updated[index] = { ...updated[index], amount: amount }
      }
    } else if (field === 'days') {
      const days = parseInt(value) || 0
      let dueDate
      if (days === 0) {
        dueDate = new Date().toISOString().split('T')[0] // Today's date
      } else {
        dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + days)
        dueDate = dueDate.toISOString().split('T')[0]
      }
      updated[index] = { ...updated[index], days: days, due_date: dueDate }
    } else if (field === 'due_date') {
      const dueDate = new Date(value)
      const daysDiff = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24))
      const days = daysDiff >= 0 ? daysDiff : 0
      updated[index] = { ...updated[index], due_date: value, days: days }
    }
    
    // If updating percentage or amount of any installment except the last one,
    // recalculate the last installment to balance to 100%
    if ((field === 'percentage' || field === 'amount') && updated.length > 1 && index < updated.length - 1) {
      const lastIndex = updated.length - 1
      
      // Calculate total percentage of all installments except the last one
      const installmentsExceptLast = updated.slice(0, -1)
      const usedPercentage = installmentsExceptLast.reduce((sum, inst) => sum + (parseFloat(inst.percentage) || 0), 0)
      
      // Calculate remaining percentage for the last installment
      const remainingPercentage = Math.max(0, 100 - usedPercentage)
      
      // Calculate amount from remaining percentage
      const remainingAmount = totalAmount > 0 ? (totalAmount * remainingPercentage / 100) : 0
      
      // Update the last installment
      updated[lastIndex] = {
        ...updated[lastIndex],
        percentage: remainingPercentage,
        amount: remainingAmount
      }
    }
    
    setManualInstallments(updated)
  }

  // Update formData.installments when manual installments change
  useEffect(() => {
    if (installmentMode === 'manual' && formData.deal_date) {
      const installments = manualInstallments.map(inst => {
        // Use stored due_date if available, otherwise calculate from days
        let dueDate = inst.due_date
        if (!dueDate && inst.days !== undefined) {
          const startDate = new Date(formData.deal_date)
          if (inst.days === 0) {
            dueDate = new Date().toISOString().split('T')[0]
          } else {
            const calculatedDate = new Date(startDate)
            calculatedDate.setDate(calculatedDate.getDate() + inst.days)
            dueDate = calculatedDate.toISOString().split('T')[0]
          }
        }
        return {
          due_date: dueDate,
          amount: inst.amount,
          percentage: inst.percentage || 0,
          days: inst.days || 0
        }
      })
      setFormData(prev => ({ ...prev, installments }))
    }
  }, [manualInstallments, installmentMode, formData.deal_date])

  // Reset installments when switching modes
  const handleModeChange = (mode) => {
    setInstallmentMode(mode)
    // Clear validation errors
    setPercentageError('')
    setAmountError('')
    setManualPercentageErrors({})
    setManualAmountErrors({})
    // Clear input states
    setManualPercentageInputs({})
    setFixPercentageInputs({})
    setFocusedPercentageIndex(null)
    setFocusedFixPercentageIndex(null)
    if (mode === 'fix') {
      setManualInstallments([])
      setNewInstallmentAmount('')
      setNewInstallmentPercentage('')
      setNewInstallmentDays('')
      setNewInstallmentDate('')
    } else {
      setInstallmentCount(0)
      setInstallmentAmount('')
      setInstallmentPercentage('')
      setInstallmentInterval(30)
      setFormData(prev => ({ ...prev, installments: [] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.customer_name || !formData.total_amount || !formData.deal_date) {
        throw new Error('Please fill in all required fields')
      }

      // Validate total installment amount
      if (formData.installments.length > 0) {
        const totalInstallmentAmount = formData.installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0)
        const dealAmount = parseFloat(formData.total_amount)
        if (totalInstallmentAmount > dealAmount) {
          throw new Error('Total installment amount cannot exceed deal amount')
        }
      }

      const response = await createDeal({
        customer_name: formData.customer_name,
        dealer_id: formData.dealer_id,
        total_amount: parseFloat(formData.total_amount),
        interest_percentage: parseFloat(formData.interest_percentage) || 0,
        deal_date: formData.deal_date,
        installments: formData.installments
      })

      navigate(`/deal/${response.data.deal_id}/details`)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bill-form-page">
      <div className="page-header">
        <h1>Create New Deal</h1>
        <p>Create a new loan/deal with interest calculation</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Deal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name *</label>
              <SearchableDropdown
                options={dealersList}
                label="name"
                id="customer_name"
                selectedVal={formData.customer_name}
                placeholder="Select or type dealer name..."
                handleChange={(val) => {
                  // val can be string or object
                  if (val && typeof val === 'object') {
                    setFormData({ ...formData, customer_name: val.name || '', dealer_id: val.id || null })
                  } else {
                    setFormData({ ...formData, customer_name: val, dealer_id: null })
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label>Total Amount *</label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Interest Percentage (Annual)</label>
              <input
                type="number"
                name="interest_percentage"
                value={formData.interest_percentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g., 12 for 12%"
              />
            </div>
            <div className="form-group">
              <label>Deal Date *</label>
              <input
                type="date"
                name="deal_date"
                value={formData.deal_date}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Installments Setup</h3>
          
          {/* Mode Selection Buttons */}
          <div className="form-row" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label>Installment Mode</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${installmentMode === 'fix' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleModeChange('fix')}
                  style={{ flex: 1 }}
                >
                  Fix
                </button>
                <button
                  type="button"
                  className={`btn ${installmentMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleModeChange('manual')}
                  style={{ flex: 1 }}
                >
                  Manual
                </button>
              </div>
            </div>
          </div>

          {/* Fix Mode UI */}
          {installmentMode === 'fix' && (
            <div className="form-row">
              <div className="form-group">
                <label>Number of Installments</label>
                <input
                  type="number"
                  value={installmentCount === 0 ? '' : installmentCount}
                  onChange={(e) => handleInstallmentCountChange(e.target.value)}
                  min="0"
                  step="1"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Percentage (%)</label>
                <input
                  type="number"
                  value={installmentPercentage}
                  onChange={(e) => handleInstallmentPercentageChange(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="e.g., 20 for 20%"
                />
                {percentageError && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                    {percentageError}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Amount per Installment</label>
                <input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => handleInstallmentAmountChange(e.target.value)}
                  step="0.01"
                  min="0"
                  className="form-control"
                />
                {amountError && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                    {amountError}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Interval (Days)</label>
                <input
                  type="number"
                  value={installmentInterval === 0 ? '' : installmentInterval}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') {
                      setInstallmentInterval(0)
                    } else {
                      const numVal = parseInt(val) || 0
                      setInstallmentInterval(numVal >= 0 ? numVal : 0)
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value
                    if (val === '' || parseInt(val) === 0 || parseInt(val) < 1) {
                      setInstallmentInterval(30)
                    }
                  }}
                  min="0"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={generateInstallments}
                >
                  Generate Installments
                </button>
              </div>
            </div>
          )}

          {/* Manual Mode UI */}
          {installmentMode === 'manual' && (
            <div>
              <div className="mt-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>Manual Installments</h4>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => addManualInstallment()}
                  >
                    Add Installment
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Percentage (%)</th>
                        <th>Amount</th>
                        <th>Days</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualInstallments.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                            No installments added yet. Click "Add Installment" above to add one.
                          </td>
                        </tr>
                      ) : (
                        manualInstallments.map((inst, idx) => {
                          const totalAmount = parseFloat(formData.total_amount) || 1
                          const percentage = inst.percentage !== undefined 
                            ? inst.percentage 
                            : (totalAmount > 0 ? (parseFloat(inst.amount) / totalAmount) * 100 : 0)
                          const dueDate = inst.due_date || (() => {
                            const startDate = new Date(formData.deal_date)
                            if (inst.days === 0) {
                              return new Date().toISOString().split('T')[0]
                            } else {
                              const calculatedDate = new Date(startDate)
                              calculatedDate.setDate(calculatedDate.getDate() + inst.days)
                              return calculatedDate.toISOString().split('T')[0]
                            }
                          })()
                          
                          return (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  type="number"
                                  value={focusedPercentageIndex === idx && manualPercentageInputs[idx] !== undefined
                                    ? manualPercentageInputs[idx]
                                    : (percentage > 0 ? percentage.toFixed(2) : '')}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    // Allow empty, numbers, and single decimal point
                                    if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                                      updateManualInstallment(idx, 'percentage', val)
                                    }
                                  }}
                                  onFocus={() => {
                                    setFocusedPercentageIndex(idx)
                                    if (manualPercentageInputs[idx] === undefined) {
                                      setManualPercentageInputs(prev => ({ ...prev, [idx]: percentage > 0 ? percentage.toString() : '' }))
                                    }
                                  }}
                                  onBlur={() => {
                                    setFocusedPercentageIndex(null)
                                    // Format the value on blur
                                    const val = manualPercentageInputs[idx]
                                    if (val !== undefined && val !== '') {
                                      const numVal = parseFloat(val) || 0
                                      setManualPercentageInputs(prev => {
                                        const newInputs = { ...prev }
                                        delete newInputs[idx]
                                        return newInputs
                                      })
                                      updateManualInstallment(idx, 'percentage', numVal.toString())
                                    }
                                  }}
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  className="form-control"
                                  style={{ width: '100px' }}
                                />
                                {manualPercentageErrors[idx] && (
                                  <div style={{ color: 'red', fontSize: '11px', marginTop: '2px' }}>
                                    {manualPercentageErrors[idx]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={inst.amount === 0 || inst.amount === undefined ? '' : inst.amount}
                                  onChange={(e) => updateManualInstallment(idx, 'amount', e.target.value)}
                                  step="0.01"
                                  min="0"
                                  className="form-control"
                                  style={{ width: '150px' }}
                                />
                                {manualAmountErrors[idx] && (
                                  <div style={{ color: 'red', fontSize: '11px', marginTop: '2px' }}>
                                    {manualAmountErrors[idx]}
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={inst.days === 0 || inst.days === undefined ? '' : inst.days}
                                  onChange={(e) => updateManualInstallment(idx, 'days', e.target.value)}
                                  min="0"
                                  className="form-control"
                                  style={{ width: '100px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="date"
                                  value={dueDate}
                                  onChange={(e) => updateManualInstallment(idx, 'due_date', e.target.value)}
                                  className="form-control"
                                  style={{ width: '150px' }}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeManualInstallment(idx)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Display Generated Installments (only for Fix mode) */}
          {installmentMode === 'fix' && formData.installments.length > 0 && (
            <div className="mt-3">
              <h4>Generated Installments ({formData.installments.length})</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Percentage (%)</th>
                        <th>Amount</th>
                        <th>Days</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                    {formData.installments.map((inst, idx) => {
                      const totalAmount = parseFloat(formData.total_amount) || 1
                      const percentage = inst.percentage !== undefined 
                        ? inst.percentage 
                        : (totalAmount > 0 ? (parseFloat(inst.amount) / totalAmount) * 100 : 0)
                      const days = inst.days !== undefined ? inst.days : (() => {
                        if (formData.deal_date && inst.due_date) {
                          const startDate = new Date(formData.deal_date)
                          const dueDate = new Date(inst.due_date)
                          return Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24))
                        }
                        return 0
                      })()
                      
                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <input
                              type="number"
                              value={focusedFixPercentageIndex === idx && fixPercentageInputs[idx] !== undefined
                                ? fixPercentageInputs[idx]
                                : (percentage > 0 ? percentage.toFixed(2) : '')}
                              onChange={(e) => {
                                const val = e.target.value
                                // Allow empty, numbers, and single decimal point
                                if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                                  updateFixInstallment(idx, 'percentage', val)
                                }
                              }}
                              onFocus={() => {
                                setFocusedFixPercentageIndex(idx)
                                if (fixPercentageInputs[idx] === undefined) {
                                  setFixPercentageInputs(prev => ({ ...prev, [idx]: percentage > 0 ? percentage.toString() : '' }))
                                }
                              }}
                              onBlur={() => {
                                setFocusedFixPercentageIndex(null)
                                // Format the value on blur
                                const val = fixPercentageInputs[idx]
                                if (val !== undefined && val !== '') {
                                  const numVal = parseFloat(val) || 0
                                  setFixPercentageInputs(prev => {
                                    const newInputs = { ...prev }
                                    delete newInputs[idx]
                                    return newInputs
                                  })
                                  updateFixInstallment(idx, 'percentage', numVal.toString())
                                }
                              }}
                              step="0.01"
                              min="0"
                              max="100"
                              className="form-control"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={inst.amount === 0 || inst.amount === undefined ? '' : inst.amount}
                              onChange={(e) => updateFixInstallment(idx, 'amount', e.target.value)}
                              step="0.01"
                              min="0"
                              className="form-control"
                              style={{ width: '150px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={days === 0 || days === undefined ? '' : days}
                              onChange={(e) => updateFixInstallment(idx, 'days', e.target.value)}
                              min="0"
                              className="form-control"
                              style={{ width: '100px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={inst.due_date}
                              onChange={(e) => updateFixInstallment(idx, 'due_date', e.target.value)}
                              className="form-control"
                              style={{ width: '150px' }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Deal'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/deals')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateDeal
