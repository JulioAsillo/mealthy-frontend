export interface SupplyForm {
  name: string
  quantity: number | null
  unit: string
  expiresOn: Date | null
}

export const emptySupplyForm = (): SupplyForm => ({
  name: '',
  quantity: 1,
  unit: 'unid',
  expiresOn: null,
})
