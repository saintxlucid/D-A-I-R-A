import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  productId: string;
  @Column()
  buyerId: string;
  @Column('float')
  amount: number;
  @Column()
  status: string;
}import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  productId: string;
  @Column()
  buyerId: string;
  @Column('float')
  amount: number;
  @Column()
  status: string;
}
