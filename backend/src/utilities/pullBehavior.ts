/**
 * Pull Behavior is a mechanism to retrieve data from a module that cannot be referenced directly.
 * The PullBehavior needs to be a member in a class, and the class holder should set the pull function by calling the 'setPullMethod'.
 * then the inner class can use 'pull' method to get the pulled data.
 * For example: when module 'A' reference module 'B' and 'B' can't reference back to 'A' because of recursive issue.
 * but some time the module 'B' needs data from module 'A', then PullBehavior help us. the PullBehavior is a member in 'B'
 * and when 'A' creates 'B' it also init 'setPullMethod' and now 'B' can retrieve data from 'A'.
 */
export class PullBehavior<T> {

    /**
     * The pull function.
     */
    private pullMethod: () => Promise<T>;

    /**
     * Is the holder set the pull function or not?
     */
    public get isPullingAvailble(): boolean {
        return this.pullMethod !== undefined;
    }

    /**
     * Set the pull function.
     * Used in the module that get pull *from* only.
     */
    public setPullMethod(pullMethod: () => Promise<T>) {
        this.pullMethod = pullMethod;
    }

    /**
     * Pull the current data.
     * Used in the puller module only.
     */
    public async pull(): Promise<T> {
        if (!this.pullMethod) {
            throw new Error(`The pull method not set yet. \nMake sure that 'setPullMethod' called in holder module`);
        }
        return await this.pullMethod();
    }
}
