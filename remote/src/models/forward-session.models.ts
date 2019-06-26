import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { LocalServer } from '.';
/**
 * Represents a local server in the system.
 */
@Entity({ name: 'forwards_sessions' })
export class ForwardSession {
    @OneToOne((type) => LocalServer)
    @JoinColumn({ name: 'server'})
    public server: LocalServer;

    @PrimaryColumn({ name: 'hashed_key', type: 'varchar', length: 256, nullable: false })
    public hashedKey: string;

    @Column({ name: 'local_user', type: 'varchar', length: 100, nullable: false })
    public localUser: string;
}
