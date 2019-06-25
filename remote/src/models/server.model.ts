import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Represents a local server in the system.
 */
@Entity({ name: 'servers' })
export class Server {
    /** The local machine mac address should be unique. */
    @PrimaryColumn()
    @Column({ name: 'physical_address', type: 'varchar', length: 12, nullable: false })
    public macAddress: string;

    /** Display name */
    @Column({ name: 'display_name', type: 'varchar', length: 30, nullable: true })
    public displayName: string;

    /** Users from the local server that can access via remote server. */
    @Column({ name: 'valid_users', type: 'varchar', array: true, nullable: false })
    public validUsers: string[];

    /** Connection with local server status. */
    connectionStatus?: boolean;
}
