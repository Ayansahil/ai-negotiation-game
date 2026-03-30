import stack4 from '../../../assets/images/stack4.png'
import stack5 from '../../../assets/images/stack5.png'
import stack6 from '../../../assets/images/stack6.png'

export const stakes = [
  {
    id: 4,
    name: 'Limited Edition Mechanical Keyboard',
    img: stack4,
    mrp: 12000,
    startPrice: 10500,
    minPrice: 7200,
  },
  {
    id: 5,
    name: 'Vintage Leather Jacket',
    img: stack5,
    mrp: 8500,
    startPrice: 7800,
    minPrice: 5000,
  },
  {
    id: 6,
    name: 'Noise Cancelling Headphones',
    img: stack6,
    mrp: 9000,
    startPrice: 8200,
    minPrice: 5800,
  },
]

export const getRandomStake = () => {
  return stakes[Math.floor(Math.random() * stakes.length)]
}