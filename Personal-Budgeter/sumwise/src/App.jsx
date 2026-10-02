import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    async function getCategories() {
      const { data, error: loadError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (loadError) setError(loadError.message)
      else setCategories(data ?? [])
      setLoading(false)
    }

    getCategories()
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const trimmedName = newCategory.trim()
    setError(null)
    setStatusMessage('')

    if (!trimmedName) {
      setError('Enter a category name first.')
      return
    }

    setAddingCategory(true)
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: trimmedName,
        household_id: import.meta.env.VITE_DEV_HOUSEHOLD_ID,
      }])
      .select()

    if (insertError) {
      setError(insertError.message)
    } else {
      setCategories((currentCategories) =>
        [...currentCategories, ...data].sort((a, b) => a.name.localeCompare(b.name)),
      )
      setNewCategory('')
      setStatusMessage(`${trimmedName} was added.`)
    }
    setAddingCategory(false)
  }

  async function handleDelete(categoryId) {
    const confirmed = window.confirm('Are you sure you want to delete this category?')
    if (!confirmed) return

    setError(null)
    setStatusMessage('')
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) setError(deleteError.message)
    else {
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      )
    }
  }

  async function handleSave(categoryId) {
    const trimmedName = editingName.trim()
    setError(null)
    setStatusMessage('')

    if (!trimmedName) {
      setError('Category name cannot be empty.')
      return
    }

    const { data, error: updateError } = await supabase
      .from('categories')
      .update({ name: trimmedName })
      .eq('id', categoryId)
      .select()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setCategories((currentCategories) =>
      currentCategories.map((category) => category.id === categoryId ? data[0] : category),
    )
    setEditingCategoryId(null)
    setEditingName('')
    setStatusMessage('Category updated.')
  }

  if (loading) return <p className="loading-message">Loading categories…</p>

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Sumwise home">
          <span className="brand-compass" aria-hidden="true">$</span>
          <span>SUMWISE</span>
        </a>
        <nav className="app-nav" aria-label="Primary navigation">
          <span>Dashboard</span><span aria-hidden="true">·</span>
          <strong>Categories</strong><span aria-hidden="true">·</span>
          <span>Transactions</span>
        </nav>
      </header>

      <main className="categories-page">
        <header className="page-heading">
          <h1>Spending categories</h1>
          <p>Create a category to organize transactions and set a monthly target.</p>
        </header>

        <section className="category-panel" aria-labelledby="new-category-title">
          <h2 id="new-category-title">Add a category</h2>
          <form className="category-form" onSubmit={handleAdd}>
            <div className="category-field">
              <label htmlFor="new-category">Category name</label>
              <input
                id="new-category"
                type="text"
                maxLength="32"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="e.g. Groceries"
                autoComplete="off"
              />
            </div>
            <button className="add-category-button" type="submit" disabled={addingCategory}>
              <span className="button-plus" aria-hidden="true">+</span>
              {addingCategory ? 'Adding…' : 'Add category'}
            </button>
          </form>
          <div className="form-feedback" aria-live="polite">
            {error && <p className="error-message">{error}</p>}
            {!error && statusMessage && <p className="success-message">{statusMessage}</p>}
          </div>
        </section>

        <section className="category-list-section" aria-labelledby="category-list-title">
          <div className="list-heading">
            <h2 id="category-list-title">Your categories</h2>
            <span>{categories.length}</span>
          </div>

          {categories.length === 0 ? (
            <p className="empty-state">No categories yet. Add your first one above.</p>
          ) : (
            <ul className="category-list">
              {categories.map((category) => (
                <li className="category-row" key={category.id}>
                  {editingCategoryId === category.id ? (
                    <div className="edit-category-form">
                      <label className="visually-hidden" htmlFor={`edit-${category.id}`}>
                        Edit {category.name}
                      </label>
                      <input
                        id={`edit-${category.id}`}
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        autoFocus
                      />
                      <button type="button" className="text-button save-button" onClick={() => handleSave(category.id)}>Save</button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setEditingCategoryId(null)
                          setEditingName('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="category-name">{category.name}</span>
                      <div className="category-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            setEditingCategoryId(category.id)
                            setEditingName(category.name)
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="text-button delete-button" onClick={() => handleDelete(category.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
