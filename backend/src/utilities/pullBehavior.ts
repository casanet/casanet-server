/**
 * Pull Behavior is a mechanism to retrieve current data from module that cannot be referenced directly.
 * most is when module reference it and it can't be reference back because of recursive issue.
 */
export class PullBehavior<T> {

    /**
     * The pull function.
     */
    private pullMethod: () => Promise<T>;

    /**
     * Set the pull function.
     * Used in the module that need to pull *from* only.
     */
    public setPullMethod(pullMethod: () => Promise<T>) {
        this.pullMethod = pullMethod;
    }

    /**
     * Pull current data.
     * Used in the puller module only.
     */
    public async pull(): Promise<T> {
        if (!this.pullMethod) {
            throw new Error(`The pull method not set yet. \nMake sure that 'setPullMethod' called in holder module`);
        }
        return await this.pullMethod();
    }
}
