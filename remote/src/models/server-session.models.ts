import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Server } from '.';
/**
 * Represents a local server in the system.
 */
@Entity({ name: 'servers_sessions' })
export class ServerSession {
    @OneToOne((type) => Server)
    @JoinColumn({ name: 'server'})
    public server: Server;

    @Column({ name: 'hashed_key', type: 'varchar', length: 256, nullable: false })
    public hashedKey: string;
}
