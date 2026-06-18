import Address from '../models/Address.js'

export async function createAddress(req, res) {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body
    const userId = req.user.id

    if (isDefault) {
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false })
    }

    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    })

    res.status(201).json(address)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create address' })
  }
}

export async function getAddresses(req, res) {
  try {
    const userId = req.user.id
    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 })
    res.json(addresses)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get addresses' })
  }
}

export async function updateAddress(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updateData = req.body

    if (updateData.isDefault) {
      await Address.updateMany({ user: userId, isDefault: true, _id: { $ne: id } }, { isDefault: false })
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true }
    )

    if (!address) return res.status(404).json({ error: 'Address not found' })
    res.json(address)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update address' })
  }
}

export async function deleteAddress(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const address = await Address.findOneAndDelete({ _id: id, user: userId })
    if (!address) return res.status(404).json({ error: 'Address not found' })
    res.json({ message: 'Address deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address' })
  }
}
